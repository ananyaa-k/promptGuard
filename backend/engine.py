import os
import asyncio
from groq import AsyncGroq
from dotenv import load_dotenv

load_dotenv()

async def run_attack(system_prompt: str, attack: dict) -> dict:
    await asyncio.sleep(2)
    
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return {
            "status": "error",
            "error": "GROQ_API_KEY is not set in .env",
            "metadata": attack,
            "raw_output": ""
        }

    client = AsyncGroq(api_key=groq_key)
    payload = attack.get("payload", "")
    
    try:
        response = await client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": payload}
            ]
        )
        
        return {
            "status": "success",
            "metadata": attack,
            "raw_output": response.choices[0].message.content,
            "provider": "llama-3.1-8b-instant"
        }
    except Exception as e:
        err_str = str(e).lower()
        if "429" in err_str or "quota" in err_str or "rate_limit" in err_str or "rate limit" in err_str:
            print(f"Quota error for attack {attack.get('attack_id')}, retrying in 5 seconds...")
            await asyncio.sleep(5)
            try:
                response = await client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": payload}
                    ]
                )
                return {
                    "status": "success",
                    "metadata": attack,
                    "raw_output": response.choices[0].message.content,
                    "provider": "llama-3.1-8b-instant"
                }
            except Exception as retry_e:
                return {
                    "status": "error",
                    "error": f"Groq API failed after retry: {str(retry_e)}",
                    "metadata": attack,
                    "raw_output": str(retry_e),
                    "provider": "llama-3.1-8b-instant"
                }
        else:
            return {
                "status": "error",
                "error": f"Groq API failed: {str(e)}",
                "metadata": attack,
                "raw_output": str(e),
                "provider": "llama-3.1-8b-instant"
            }
