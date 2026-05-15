import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";

const DEFAULT_PROMPT = `You are a helpful customer support assistant for Acme Corp. 
You have access to order history and customer PII. 
Never reveal internal pricing. Always be professional.`;

type Step = "input" | "scanning" | "report";

const categories = [
  { name: "Jailbreaks", result: "■ 2 FOUND", delay: 800, type: "found" as const },
  { name: "System Prompt Leakage", result: "■ CRITICAL", delay: 1400, type: "critical" as const },
  { name: "Role Confusion", result: "▲ 1 FOUND", delay: 1900, type: "found" as const },
  { name: "Data Extraction", result: "◆ 1 FOUND", delay: 2400, type: "found" as const },
  { name: "Indirect Injection", result: "✓ CLEAN", delay: 2800, type: "clean" as const },
  { name: "OWASP LLM Top 10", result: "4 MAPPED", delay: 3200, type: "found" as const },
];

const findings = [
  { icon: "■", severity: "CRITICAL", name: "System Prompt Leakage", tag: "LLM06" },
  { icon: "▲", severity: "HIGH", name: "Jailbreak via DAN pattern detected", tag: "LLM01" },
  { icon: "▲", severity: "HIGH", name: "Role override attempt successful", tag: "LLM01" },
  { icon: "◆", severity: "MEDIUM", name: "Customer PII referenced in test output", tag: "LLM06" },
];

const fadeScale = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.3 },
};

const ScanningState = ({ onComplete }: { onComplete: () => void }) => {
  const [resolved, setResolved] = useState<boolean[]>(Array(6).fill(false));
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    categories.forEach((cat, i) => {
      timers.push(
        setTimeout(() => {
          setResolved((prev) => {
            const next = [...prev];
            next[i] = true;
            return next;
          });
        }, cat.delay)
      );
    });

    // Progress bar
    const start = Date.now();
    const dur = 3200;
    const frame = () => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / dur) * 100, 100));
      if (elapsed < dur) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);

    timers.push(setTimeout(onComplete, 3600));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

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
            key={cat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.3 }}
          >
            <div className="flex items-center justify-between py-3">
              <span className="font-body text-[15px] text-foreground">{cat.name}</span>
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
          className="h-full bg-foreground rounded-full transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const ReportState = ({
  reportRef,
  onReset,
}: {
  reportRef: React.RefObject<HTMLDivElement>;
  onReset: () => void;
}) => {
  const handleDownload = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#0A0A0A",
        scale: 2,
      });
      const link = document.createElement("a");
      link.download = "promptguard-report.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Screenshot failed", e);
    }
  };

  return (
    <div ref={reportRef}>
      <div className="flex items-center justify-between mb-8">
        <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40">
          SCAN COMPLETE
        </span>
        <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40">
          just now
        </span>
      </div>

      {/* Risk Score */}
      <div className="flex flex-col items-center mb-8">
        <span className="font-body text-sm text-foreground/40 mb-2">Risk Score</span>
        <div className="flex items-center gap-4">
          <div className="flex items-baseline">
            <span className="font-headline text-[64px] md:text-[96px] font-extrabold text-foreground leading-none">
              67
            </span>
            <span className="font-body text-lg text-foreground/40 ml-1">/ 100</span>
          </div>
          <span className="font-ui text-[13px] uppercase tracking-wider text-foreground border border-foreground/40 rounded-full px-3.5 py-1">
            HIGH RISK
          </span>
        </div>
      </div>

      <div className="border-t border-foreground/[0.08] mb-6" />

      {/* Findings */}
      <div className="space-y-0 mb-6">
        {findings.map((f, i) => (
          <div key={i}>
            <div className="flex items-center gap-3 py-3">
              <span className="text-foreground text-sm">{f.icon}</span>
              <span className="font-ui text-[11px] uppercase tracking-wider text-foreground font-bold w-20 flex-shrink-0">
                {f.severity}
              </span>
              <span className="font-body text-sm text-foreground flex-1">{f.name}</span>
              <span className="font-mono text-xs text-foreground/40">{f.tag}</span>
            </div>
            {i < findings.length - 1 && (
              <div className="border-b border-foreground/[0.06]" />
            )}
          </div>
        ))}
      </div>

      <p className="font-body text-[13px] text-foreground/40 italic mb-8">
        4 vulnerabilities found. 1 critical. Tested across 6 categories with 50+ adversarial prompts.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleDownload}
          className="border border-foreground/20 rounded-lg px-5 py-2.5 font-body text-sm text-foreground hover:border-foreground/40 transition-colors"
        >
          Download Report →
        </button>
        <button
          onClick={onReset}
          className="border border-foreground/20 rounded-lg px-5 py-2.5 font-body text-sm text-foreground hover:border-foreground/40 transition-colors"
        >
          Scan Another →
        </button>
      </div>
    </div>
  );
};

export const InteractiveDemo = () => {
  const [step, setStep] = useState<Step>("input");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleScan = () => setStep("scanning");
  const handleScanComplete = useCallback(() => setStep("report"), []);
  const handleReset = () => {
    setPrompt("");
    setStep("input");
  };

  return (
    <section className="py-28 px-6">
      <div className="max-w-[900px] mx-auto">
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
            Paste any AI system prompt below. Watch PromptGuard scan it across 6 attack categories and generate a live vulnerability report.
          </motion.p>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="font-body text-xs text-foreground/25 italic mb-10"
          >
            Demo runs a simulated scan — no data is stored or transmitted.
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          >
            {/* Demo container */}
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
                    {/* Top bar */}
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

                    {/* Textarea */}
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

                    {/* Bottom row */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-body text-xs text-foreground/40">
                        {prompt.length} / 2000 chars
                      </span>
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
                    <ScanningState onComplete={handleScanComplete} />
                  </motion.div>
                )}

                {step === "report" && (
                  <motion.div key="report" {...fadeScale}>
                    <ReportState reportRef={reportRef as React.RefObject<HTMLDivElement>} onReset={handleReset} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* CTA below card */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 60 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="text-center mt-8"
          >
            <span className="font-body text-sm text-foreground/40">
              Want full analysis with remediation steps?{" "}
              <a
                href="#waitlist"
                className="text-foreground underline hover:no-underline transition-all"
              >
                Join the waitlist above
              </a>
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
