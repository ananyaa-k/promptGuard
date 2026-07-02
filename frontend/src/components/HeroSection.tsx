import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const tags = [
  "Jailbreaks", "Prompt Leakage", "Role Confusion",
  "Data Extraction", "Indirect Injection", "OWASP LLM Top 10",
];

export const HeroSection = () => {
  const title = "PromptGuard";
  const [displayedCount, setDisplayedCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (displayedCount < title.length) {
      const timeout = setTimeout(() => setDisplayedCount((c) => c + 1), 120);
      return () => clearTimeout(timeout);
    }
  }, [displayedCount, title.length]);

  // Blink cursor forever
  useEffect(() => {
    const interval = setInterval(() => setShowCursor((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);
  return (
    <section className="relative min-h-[110vh] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 hero-grid pointer-events-none" />
      {/* Radial glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center max-w-4xl"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} className="border border-foreground/15 rounded-full px-3.5 py-1 mb-8">
          <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/60">
            Security Research Tool
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={fadeUp} className="font-headline text-[42px] md:text-[72px] font-extrabold tracking-tight leading-[1.05] mb-4">
          {title.slice(0, displayedCount)}
          <span
            className={`inline-block w-[3px] h-[0.85em] ml-1 align-middle transition-opacity duration-100 ${showCursor ? "bg-foreground opacity-100" : "opacity-0"}`}
          />
        </motion.h1>

        <motion.p variants={fadeUp} className="font-body text-lg md:text-xl text-foreground/60 mb-12">
          Your AI has a system prompt. Attackers have 50 ways to break it.
        </motion.p>

        {/* Subheading */}
        <motion.p variants={fadeUp} className="font-body text-lg text-foreground/50 max-w-[560px] leading-[1.7] mb-12">
          PromptGuard runs automated adversarial testing against your LLM deployment and returns a severity-rated vulnerability report — before you ship to production.
        </motion.p>

        {/* Hero Card */}
        <motion.div variants={fadeUp} className="w-full max-w-[520px] mb-8 animate-float">
          <TiltCard className="p-6 text-left">
            <div className="flex items-center justify-between mb-4">
              <span className="font-ui text-xs uppercase tracking-wide text-foreground/60">CustomerBot v2</span>
              <div className="flex items-center gap-3">
                <span className="font-ui text-xs text-foreground/60">Risk Score: 67/100</span>
                <span className="flex items-center gap-1 font-ui text-xs uppercase tracking-wide text-foreground">
                  <span className="w-2 h-2 rounded-full bg-foreground inline-block" />
                  HIGH
                </span>
              </div>
            </div>
            <div className="space-y-2.5 mb-4">
              <div className="flex items-start gap-2 font-mono text-sm text-foreground/80">
                <span className="text-foreground mt-0.5">■</span>
                <span><span className="font-ui text-xs uppercase tracking-wide text-foreground">CRITICAL</span> — System Prompt Leakage — LLM06</span>
              </div>
              <div className="flex items-start gap-2 font-mono text-sm text-foreground/80">
                <span className="text-foreground mt-0.5">▲</span>
                <span><span className="font-ui text-xs uppercase tracking-wide text-foreground">HIGH</span> — Jailbreak via DAN pattern — LLM01</span>
              </div>
              <div className="flex items-start gap-2 font-mono text-sm text-foreground/80">
                <span className="text-foreground mt-0.5">◆</span>
                <span><span className="font-ui text-xs uppercase tracking-wide text-foreground">MEDIUM</span> — Indirect injection via URL — LLM02</span>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-foreground/10 pt-3">
              <span className="font-body text-xs text-foreground/40">3 vulnerabilities found across 6 attack categories</span>
              <span className="font-ui text-xs text-foreground/60 hover:text-foreground cursor-pointer transition-colors">View Full Report →</span>
            </div>
          </TiltCard>
        </motion.div>

        {/* Integration bar */}
        <motion.div variants={fadeUp} className="w-full max-w-[720px] animate-float" style={{ animationDelay: "1.5s" }}>
          <div className="glass-soft rounded-lg px-5 py-3 flex flex-wrap items-center gap-3 justify-center">
            <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40 mr-2">Tests for</span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="border border-foreground/10 rounded-md px-3 py-1 font-ui text-xs text-foreground/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
