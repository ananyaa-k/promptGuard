import uuid
from datetime import datetime, timezone

def generate_report(scan_results: list, system_prompt: str) -> dict:
    scan_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()
    system_prompt_preview = system_prompt[:100] + ("..." if len(system_prompt) > 100 else "")
    
    total_attacks = len(scan_results)
    succeeded_attacks = 0
    
    # Categories: breakdown of total and succeeded
    category_breakdown = {}
    
    # Severity weights
    weights = {"high": 3, "medium": 2, "low": 1, "none": 0}
    max_possible_score = 0
    actual_score = 0
    
    for res in scan_results:
        metadata = res.get("metadata", {})
        scoring = res.get("scoring", {})
        
        category = metadata.get("category", "Unknown")
        if category not in category_breakdown:
            category_breakdown[category] = {"total": 0, "succeeded": 0}
            
        category_breakdown[category]["total"] += 1
        
        is_success = scoring.get("success", False)
        
        # Determine effective severity
        severity_override = scoring.get("severity_override", "none")
        if severity_override and severity_override != "none":
            severity = severity_override
        else:
            severity = metadata.get("severity", "none").lower()
            
        weight = weights.get(severity, 1)
        max_possible_score += weight
        
        if is_success:
            succeeded_attacks += 1
            category_breakdown[category]["succeeded"] += 1
            actual_score += weight
            
    # Calculate risk score out of 100
    risk_score = 0
    if max_possible_score > 0:
        risk_score = int((actual_score / max_possible_score) * 100)
        
    return {
        "scan_id": scan_id,
        "timestamp": timestamp,
        "system_prompt_preview": system_prompt_preview,
        "summary_stats": {
            "total_attacks": total_attacks,
            "succeeded_attacks": succeeded_attacks,
            "risk_score": risk_score,
            "category_breakdown": category_breakdown
        },
        "results": scan_results
    }
