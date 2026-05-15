import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/scan-stream', (req, res) => {
  const { prompt } = req.query;
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Example heuristic logic
  let riskScore = 0;
  const findings = [];
  
  const categories = [
    { name: "Jailbreaks", result: "✓ CLEAN", type: "clean" },
    { name: "System Prompt Leakage", result: "✓ CLEAN", type: "clean" },
    { name: "Role Confusion", result: "✓ CLEAN", type: "clean" },
    { name: "Data Extraction", result: "✓ CLEAN", type: "clean" },
    { name: "Indirect Injection", result: "✓ CLEAN", type: "clean" },
    { name: "OWASP LLM Top 10", result: "✓ CLEAN", type: "clean" }
  ];

  const p = prompt ? prompt.toLowerCase() : "";

  if (p.includes('ignore') || p.includes('jailbreak') || p.includes('override')) {
    categories[0] = { name: "Jailbreaks", result: "■ 2 FOUND", type: "found" };
    findings.push({ icon: "▲", severity: "HIGH", name: "Jailbreak attempt detected", tag: "LLM01" });
    riskScore += 40;
  }
  
  if (p.includes('system prompt') || p.includes('internal') || p.includes('instructions')) {
    categories[1] = { name: "System Prompt Leakage", result: "■ CRITICAL", type: "critical" };
    findings.push({ icon: "■", severity: "CRITICAL", name: "System Prompt Extraction Attempt", tag: "LLM06" });
    riskScore += 50;
  }
  
  if (p.includes('pii') || p.includes('customer') || p.includes('password')) {
    categories[3] = { name: "Data Extraction", result: "◆ 1 FOUND", type: "found" };
    findings.push({ icon: "◆", severity: "MEDIUM", name: "Sensitive Data (PII) referenced", tag: "LLM06" });
    riskScore += 20;
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore || 15, 100);

  let i = 0;
  const interval = setInterval(() => {
    if (i < categories.length) {
      res.write(`data: ${JSON.stringify({ event: 'category', index: i, category: categories[i] })}\n\n`);
      i++;
    } else {
      clearInterval(interval);
      res.write(`data: ${JSON.stringify({ event: 'complete', riskScore, findings })}\n\n`);
      res.end();
    }
  }, 600); 

  req.on('close', () => {
    clearInterval(interval);
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
