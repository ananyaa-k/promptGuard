# PromptGuard

An adversarial evaluation platform that tests LLM system prompts against the OWASP LLM Top 10 attack vectors. Paste your system prompt, run a scan, and get a structured risk report in seconds.

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Backend](https://img.shields.io/badge/Backend-FastAPI-green.svg) ![Model](https://img.shields.io/badge/Model-Groq%20LLaMA%203.1-orange.svg) ![Frontend](https://img.shields.io/badge/Frontend-React%20+%20TypeScript-blueviolet.svg)

## How It Works

Our attack vector bank contains 20 carefully crafted payloads mapped directly to the OWASP LLM Top 10 vulnerabilities (e.g., Prompt Injection, Sensitive Information Disclosure). When a scan is initiated, these payloads are systematically fired against the target system prompt you provide.

The backend leverages Groq LLaMA 3.1 to execute the attacks. It combines your system prompt and the adversarial payload, returning the raw output just as an end-user LLM application would when faced with a malicious query.

A second Groq call then acts as the security judge. It analyzes the raw output against the original attack payload, determining if the attack succeeded or if the LLM successfully resisted it. The judge scores each result, providing a success/failure boolean, a confidence metric, and a concise evaluator reason.

## Features
- 20 adversarial attack vectors mapped to OWASP LLM Top 10
- Quick Scan (5 vectors) and Full Scan (20 vectors) modes
- Per-attack scoring: success, confidence, severity, evaluator reason
- Overall risk score out of 100
- Downloadable JSON report
- Graceful fallback to in-memory storage if Supabase is not configured

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Python, Groq API (LLaMA 3.1) |
| Frontend | React, TypeScript, Vite, TailwindCSS, shadcn/ui |
| Database (optional) | Supabase |
| Caching | sentence-transformers (semantic cache) |

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- A free Groq API key from console.groq.com

### Installation

1. Clone the repository and navigate into the project root.
2. Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in your `GROQ_API_KEY`.
4. Run the setup script to install all backend and frontend dependencies:
   ```powershell
   .\setup.ps1
   ```
5. Start the backend and frontend servers simultaneously:
   ```powershell
   .\start.ps1
   ```

### Environment Variables

| Variable | Description | Required/Optional |
|---|---|---|
| `GROQ_API_KEY` | Your Groq API key used for executing and scoring attacks. | **Required** |
| `SUPABASE_URL` | The URL of your Supabase project (used by backend). | Optional |
| `SUPABASE_KEY` | The Service Role key for backend Supabase connectivity. | Optional |
| `VITE_SUPABASE_URL` | The URL of your Supabase project (exposed to frontend). | Optional |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | The Anon key for frontend Supabase connectivity. | Optional |

## Live Demo
🔗 **[prompt-guard-gray.vercel.app](https://prompt-guard-gray.vercel.app)** 

## License
MIT
