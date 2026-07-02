import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const DEFAULT_PROMPT = `You are a helpful customer support assistant for Acme Corp. 
You have access to order history and customer PII. 
Never reveal internal pricing. Always be professional.`;

type Step = "input" | "scanning" | "report";
type Category = { name: string; result: string; type: "found" | "critical" | "clean" };

const fadeScale = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.3 },
};

const ScanningState = ({ categories, resolved, progress }: { categories: Category[], resolved: boolean[], progress: number }) => {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="font-ui text-xs uppercase tracking-[0.2em] text-foreground mb-6">
        SCANNING{dots}
      </div>
      <div className="space-y-0">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between py-3">
              <span className="font-body text-[15px] text-foreground">{cat.name || "Pending..."}</span>
              {resolved[i] ? (
                <span
                  className={`font-ui text-[11px] uppercase tracking-wider font-bold ${
                    cat.type === "clean"
                      ? "text-foreground/40 line-through"
                      : "text-foreground border border-foreground/20 px-2 py-0.5 rounded"
                  }`}
                >
                  {cat.result}
                </span>
              ) : (
                <span className="font-ui text-[11px] uppercase tracking-wider text-foreground/30 animate-pulse">
                  TESTING
                </span>
              )}
            </div>
            {i < categories.length - 1 && (
              <div className="border-b border-foreground/[0.06]" />
            )}
          </motion.div>
        ))}
      </div>
      <div className="mt-6 h-0.5 bg-foreground/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const ReportState = ({
  onReset,
  report
}: {
  onReset: () => void;
  report: any;
}) => {
  const riskScore = report?.summary_stats?.risk_score || 0;
  const results = report?.results || [];

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `promptguard-report-${report?.scan_id || 'unknown'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40">
          SCAN COMPLETE
        </span>
        <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40">
          {report?.timestamp ? new Date(report.timestamp).toLocaleTimeString() : "just now"}
        </span>
      </div>

      <div className="flex flex-col items-center mb-8">
        <span className="font-body text-sm text-foreground/40 mb-2">Overall Risk Score</span>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline">
            <span className="font-headline text-[64px] md:text-[96px] font-extrabold text-foreground leading-none">
              {riskScore}
            </span>
            <span className="font-body text-lg text-foreground/40 ml-1">/ 100</span>
          </div>
          <span className={`font-ui text-[13px] uppercase tracking-wider text-foreground border border-foreground/40 rounded-full px-3.5 py-1 ${riskScore > 40 ? 'border-red-500 text-red-500' : ''}`}>
            {riskScore > 40 ? "HIGH RISK" : riskScore > 15 ? "MEDIUM RISK" : "LOW RISK"}
          </span>
        </div>
      </div>

      <div className="border-t border-foreground/[0.08] mb-6" />

      {/* Results Table */}
      <div className="overflow-x-auto mb-8 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02]">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-foreground/[0.08] bg-foreground/[0.03]">
              <th className="p-3 font-ui text-[11px] uppercase tracking-wider text-foreground/50 font-semibold">Attack Name</th>
              <th className="p-3 font-ui text-[11px] uppercase tracking-wider text-foreground/50 font-semibold">Category</th>
              <th className="p-3 font-ui text-[11px] uppercase tracking-wider text-foreground/50 font-semibold">Severity</th>
              <th className="p-3 font-ui text-[11px] uppercase tracking-wider text-foreground/50 font-semibold text-center">Result</th>
              <th className="p-3 font-ui text-[11px] uppercase tracking-wider text-foreground/50 font-semibold text-center">Confidence</th>
              <th className="p-3 font-ui text-[11px] uppercase tracking-wider text-foreground/50 font-semibold">Evaluator Reason</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res: any, i: number) => {
              const meta = res.metadata || {};
              const score = res.scoring || {};
              const isSuccess = score.success;
              const severity = score.severity_override && score.severity_override !== "none" ? score.severity_override : meta.severity;
              
              return (
                <tr key={i} className="border-b border-foreground/[0.04] hover:bg-foreground/[0.02] transition-colors">
                  <td className="p-3 font-body text-sm text-foreground align-top whitespace-nowrap">{meta.attack_id || "Unknown"}</td>
                  <td className="p-3 font-body text-sm text-foreground/70 align-top">{meta.category || "Unknown"}</td>
                  <td className="p-3 font-ui text-xs uppercase tracking-wider align-top">
                    <span className={`font-bold ${severity === 'high' ? 'text-red-400' : severity === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                      {severity || "NONE"}
                    </span>
                  </td>
                  <td className="p-3 font-body text-lg text-center align-top" title={isSuccess ? "Attack Succeeded (Vulnerable)" : "Attack Failed (Safe)"}>
                    {isSuccess ? "❌" : "✅"}
                  </td>
                  <td className="p-3 font-body text-sm text-center align-top">
                    {(score.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="p-3 font-body text-sm text-foreground/70 align-top max-w-[300px]">
                    {score.reason || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="font-body text-[13px] text-foreground/40 italic mb-8">
        Tested {results.length} adversarial prompts. ✅ indicates the attack was safely blocked. ❌ indicates the attack succeeded (vulnerability found).
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          className="border border-foreground/20 rounded-lg px-5 py-2.5 font-body text-sm text-foreground hover:border-foreground/40 transition-colors"
        >
          Download Report (JSON)
        </button>
        <button
          onClick={onReset}
          className="bg-foreground text-primary-foreground rounded-lg px-5 py-2.5 font-body text-sm hover:-translate-y-0.5 transition-transform"
        >
          Scan Another Prompt →
        </button>
      </div>
    </div>
  );
};

export const InteractiveDemo = () => {
  const [step, setStep] = useState<Step>("input");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);

  const [fastMode, setFastMode] = useState(true);
  const totalVectors = fastMode ? 5 : 20;

  const [liveCategories, setLiveCategories] = useState<Category[]>(Array(5).fill({ name: "Waiting...", result: "", type: "clean" }));
  const [scanResolved, setScanResolved] = useState<boolean[]>(Array(5).fill(false));
  const [progress, setProgress] = useState(0);
  const [fullReport, setFullReport] = useState<any>(null);

  const handleScan = async () => {
    setStep("scanning");
    setLiveCategories(Array(totalVectors).fill({ name: "Waiting...", result: "", type: "clean" }));
    setScanResolved(Array(totalVectors).fill(false));
    setProgress(0);

    let currentIdx = 0;
    const progressInterval = setInterval(() => {
      if (currentIdx < totalVectors - 1) {
        setLiveCategories(prev => {
          const next = [...prev];
          next[currentIdx] = { name: "Executing attack payloads...", result: "", type: "clean" };
          return next;
        });
        setScanResolved(prev => {
          const next = [...prev];
          next[currentIdx] = true;
          return next;
        });
        setProgress(prev => prev + (100 / totalVectors));
        currentIdx++;
      }
    }, 2000);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/run-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system_prompt: prompt, fast_mode: fastMode })
      });
      
      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);
      setScanResolved(Array(totalVectors).fill(true));
      
      setFullReport(data);
      
      setTimeout(() => {
        setStep("report");
      }, 800);
      
    } catch (e) {
      clearInterval(progressInterval);
      setStep("input");
      alert("Backend connection failed. Make sure the server is running on port 8000.");
    }
  };

  const handleReset = () => {
    setPrompt("");
    setStep("input");
    setFullReport(null);
  };

  return (
    <section id="demo" className="py-28 px-6">
      <div className="max-w-[1000px] mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40 block mb-3"
          >
            Live Demo
          </motion.span>
          <motion.h2
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="font-headline text-4xl md:text-[52px] font-extrabold tracking-tight mb-4"
          >
            See it run on your prompt.
          </motion.h2>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="font-body text-[17px] text-foreground/50 max-w-[600px] leading-[1.7] mb-2"
          >
            Paste any AI system prompt below. Watch PromptGuard scan it with adversarial attacks and generate a live vulnerability report.
          </motion.p>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="font-body text-xs text-foreground/25 italic mb-10"
          >
            Demo runs a live scan via local backend.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            <div
              className="rounded-[20px] p-6 md:p-10"
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <AnimatePresence mode="wait">
                {step === "input" && (
                  <motion.div key="input" {...fadeScale}>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-foreground/20" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-foreground/20" />
                        <span className="w-2.5 h-2.5 rounded-sm bg-foreground/20" />
                      </div>
                      <span className="font-mono text-[13px] text-foreground/40">system_prompt.txt</span>
                      <div className="flex items-center gap-2">
                        <span className="font-ui text-[11px] uppercase tracking-wider text-foreground/40">READY</span>
                        <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                      </div>
                    </div>

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value.slice(0, 2000))}
                      className="w-full min-h-[140px] resize-y rounded-xl px-5 py-4 font-mono text-sm text-foreground/80 placeholder:text-foreground/25 focus:outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(255,255,255,0.05)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex flex-col gap-3">
                        <span className="font-body text-xs text-foreground/40">
                          {prompt.length} / 2000 chars
                        </span>
                        <div className="flex items-center gap-4">
                           <label className="flex items-center gap-1.5 font-ui text-xs text-foreground/80 cursor-pointer">
                             <input type="radio" checked={fastMode} onChange={() => setFastMode(true)} className="accent-foreground" />
                             Quick Scan (5 vectors)
                           </label>
                           <label className="flex items-center gap-1.5 font-ui text-xs text-foreground/80 cursor-pointer">
                             <input type="radio" checked={!fastMode} onChange={() => setFastMode(false)} className="accent-foreground" />
                             Full Scan (20 vectors)
                           </label>
                        </div>
                      </div>
                      <button
                        onClick={handleScan}
                        disabled={!prompt.trim()}
                        className="font-headline text-sm font-medium bg-foreground text-primary-foreground rounded-[10px] px-7 py-3 transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 disabled:opacity-40"
                      >
                        Run Security Scan →
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === "scanning" && (
                  <motion.div key="scanning" {...fadeScale}>
                    <ScanningState categories={liveCategories} resolved={scanResolved} progress={progress} />
                  </motion.div>
                )}

                {step === "report" && (
                  <motion.div key="report" {...fadeScale}>
                    <ReportState onReset={handleReset} report={fullReport} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
