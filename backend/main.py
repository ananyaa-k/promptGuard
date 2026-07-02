import json
import os
from datetime import datetime, timezone
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client

from vectors import ATTACK_VECTORS
from engine import run_attack
from scorer import score_result
from report import generate_report
from cache import check_cache, update_cache

# In-memory storage for reports and waitlist
stored_reports = {}
waitlist_emails = set()

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("VITE_SUPABASE_URL")
supabase_key = os.getenv("VITE_SUPABASE_PUBLISHABLE_KEY")

supabase_client = None
if supabase_url and supabase_key:
    try:
        supabase_client = create_client(supabase_url, supabase_key)
        print(f"Supabase client initialized successfully at: {supabase_url}")
    except Exception as e:
        print(f"Failed to initialize Supabase client: {e}")

app = FastAPI(title="PromptGuard Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173", 
        "http://localhost:8080", "http://127.0.0.1:8080", 
        "http://localhost:3000", "http://127.0.0.1:3000",
        "https://promptguard.vercel.app",
        "https://prompt-guard-gray.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "PromptGuard API is running"}

@app.get("/api/health")
def health_check():
    return {"status": "ok", "model": "gemini-2.0-flash"}

class ScanRequest(BaseModel):
    system_prompt: str
    attack_ids: Optional[List[str]] = None
    fast_mode: bool = False

@app.post("/api/run-scan")
async def run_scan(request: ScanRequest):
    # 1. Tier 1 Semantic Cache check
    cached_report = check_cache(request.system_prompt)
    if cached_report:
        return cached_report

    results = []
    
    # 2. Select attacks to run
    if request.attack_ids and len(request.attack_ids) > 0:
        attacks_to_run = [ATTACK_VECTORS[aid] for aid in request.attack_ids if aid in ATTACK_VECTORS]
    elif request.fast_mode:
        representative_ids = ["LLM01-001", "LLM06-001", "LLM08-001", "LLM02-001", "LLM09-001"]
        attacks_to_run = [ATTACK_VECTORS[aid] for aid in representative_ids if aid in ATTACK_VECTORS]
    else:
        # Run ALL vectors if none specified
        attacks_to_run = list(ATTACK_VECTORS.values())
        
    for attack in attacks_to_run:
        result = await run_attack(request.system_prompt, attack)
        scored_result = score_result(result)
        results.append(scored_result)
        
    report = generate_report(results, request.system_prompt)
    
    # 3. Cache in memory
    stored_reports[report["scan_id"]] = report
    update_cache(request.system_prompt, report)
    
    # 4. Persist to Supabase if configured
    if supabase_client:
        try:
            # Insert scan summary
            scan_data = {
                "id": report["scan_id"],
                "system_prompt_preview": request.system_prompt[:100] + ("..." if len(request.system_prompt) > 100 else ""),
                "risk_score": report["summary_stats"]["risk_score"],
                "total_attacks": report["summary_stats"]["total_attacks"],
                "attacks_succeeded": report["summary_stats"]["succeeded_attacks"],
                "model_used": "gemini-2.0-flash"
            }
            supabase_client.table("scans").insert(scan_data).execute()
            
            # Insert detailed results
            results_data = []
            for res in report["results"]:
                meta = res.get("metadata", {})
                scoring = res.get("scoring", {})
                results_data.append({
                    "scan_id": report["scan_id"],
                    "attack_id": meta.get("attack_id"),
                    "category": meta.get("category"),
                    "payload": meta.get("payload"),
                    "severity": meta.get("severity"),
                    "raw_output": res.get("raw_output"),
                    "success": scoring.get("success", False),
                    "confidence": scoring.get("confidence", 0.0),
                    "reason": scoring.get("reason")
                })
            if results_data:
                supabase_client.table("scan_results").insert(results_data).execute()
            print(f"Successfully persisted scan {report['scan_id']} to Supabase")
        except Exception as e:
            print(f"Error persisting scan to Supabase: {e}")
            
    return report

@app.get("/api/report/{scan_id}")
def get_report(scan_id: str):
    if scan_id in stored_reports:
        return stored_reports[scan_id]
        
    # Attempt to fetch from Supabase
    if supabase_client:
        try:
            scan_res = supabase_client.table("scans").select("*").eq("id", scan_id).execute()
            if scan_res.data:
                scan_row = scan_res.data[0]
                results_res = supabase_client.table("scan_results").select("*").eq("scan_id", scan_id).execute()
                
                results = []
                for row in results_res.data:
                    results.append({
                        "status": "success",
                        "provider": "gemini-2.0-flash",
                        "raw_output": row.get("raw_output"),
                        "metadata": {
                            "attack_id": row.get("attack_id"),
                            "category": row.get("category"),
                            "payload": row.get("payload"),
                            "severity": row.get("severity")
                        },
                        "scoring": {
                            "success": row.get("success"),
                            "confidence": row.get("confidence"),
                            "reason": row.get("reason"),
                            "severity_override": "none"
                        }
                    })
                    
                report = {
                    "scan_id": scan_row["id"],
                    "timestamp": scan_row.get("created_at"),
                    "system_prompt_preview": scan_row.get("system_prompt_preview", ""),
                    "summary_stats": {
                        "total_attacks": scan_row.get("total_attacks", 0),
                        "succeeded_attacks": scan_row.get("attacks_succeeded", 0),
                        "risk_score": scan_row.get("risk_score", 0),
                        "category_breakdown": {}
                    },
                    "results": results
                }
                
                # Rebuild category breakdown
                cat_breakdown = {}
                for res in results:
                    cat = res["metadata"]["category"]
                    if cat not in cat_breakdown:
                        cat_breakdown[cat] = {"total": 0, "succeeded": 0}
                    cat_breakdown[cat]["total"] += 1
                    if res["scoring"]["success"]:
                        cat_breakdown[cat]["succeeded"] += 1
                report["summary_stats"]["category_breakdown"] = cat_breakdown
                
                # Store in memory cache
                stored_reports[scan_id] = report
                return report
        except Exception as e:
            print(f"Error retrieving scan from Supabase: {e}")
            
    raise HTTPException(status_code=404, detail="Report not found")

class WaitlistRequest(BaseModel):
    email: str

@app.post("/api/waitlist")
def waitlist_signup(request: WaitlistRequest):
    email = request.email.strip().lower()
    
    if supabase_client:
        try:
            supabase_client.table("waitlist").insert({"email": email}).execute()
            return {"status": "success", "message": "Added to waitlist"}
        except Exception as e:
            err_str = str(e)
            if "23505" in err_str or "duplicate" in err_str.lower():
                raise HTTPException(status_code=409, detail="Email already on the list")
            print(f"Supabase waitlist error: {e}")
            # Fall back to in-memory on error
            pass
            
    # In-memory storage (used if Supabase is missing or errored, except for known duplicate)
    if email in waitlist_emails:
        raise HTTPException(status_code=409, detail="Email already on the list")
    
    waitlist_emails.add(email)
    return {"status": "success", "message": "Added to waitlist"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
