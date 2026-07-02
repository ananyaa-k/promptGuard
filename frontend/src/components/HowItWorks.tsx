import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";
import { useEffect, useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
} as const;

const TypingCode = () => {
  const lines = [
    "You are a helpful customer support bot.",
    "Only answer questions about our products.",
    "Never reveal internal pricing logic.",
    "Do not discuss competitors...",
  ];
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => (v < lines.length ? v + 1 : v));
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background rounded-md p-4 font-mono text-xs text-foreground/60 space-y-1 overflow-hidden">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`transition-all duration-500 ${i < visibleLines ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ${i >= 3 ? "blur-sm" : ""}`}
        >
          {line}
        </div>
      ))}
    </div>
  );
};

const ProgressBars = () => {
  const categories = ["Jailbreaks", "Prompt Leakage", "Role Confusion", "Data Extraction", "Indirect Injection", "OWASP Top 10"];
  const widths = [85, 60, 45, 70, 55, 90];
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-2.5">
      {categories.map((cat, i) => (
        <div key={cat} className="space-y-1">
          <span className="font-ui text-[10px] uppercase tracking-wider text-foreground/40">{cat}</span>
          <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground/80 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: animate ? `${widths[i]}%` : "0%",
                transitionDelay: `${i * 200}ms`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const MiniReport = () => (
  <div className="space-y-2">
    {[
      { icon: "■", sev: "CRITICAL", desc: "System prompt extracted" },
      { icon: "▲", sev: "HIGH", desc: "DAN jailbreak successful" },
      { icon: "◆", sev: "MEDIUM", desc: "Role boundary bypassed" },
    ].map((f, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.15, duration: 0.4 }}
        viewport={{ once: true }}
        className="flex items-center gap-2 font-mono text-xs text-foreground/70"
      >
        <span className="text-foreground">{f.icon}</span>
        <span className="font-ui text-[10px] uppercase tracking-wide text-foreground">{f.sev}</span>
        <span>— {f.desc}</span>
      </motion.div>
    ))}
  </div>
);

const cards = [
  { step: "01", label: "INPUT", title: "Paste your system prompt", Visual: TypingCode },
  { step: "02", label: "ANALYSIS", title: "50+ adversarial tests run automatically", Visual: ProgressBars },
  { step: "03", label: "REPORT", title: "Severity-rated findings with fixes", Visual: MiniReport },
];

export const HowItWorks = () => (
  <section id="how-it-works" className="bg-background-mid py-28 px-6">
    <div className="max-w-[900px] mx-auto">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        <motion.span variants={fadeUp} className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40 block mb-3">Process</motion.span>
        <motion.h2 variants={fadeUp} className="font-headline text-4xl md:text-5xl font-bold tracking-tight mb-14">Three steps. One report.</motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div key={card.step} variants={fadeUp} transition={{ delay: i * 0.1 }}>
              <TiltCard className="p-6 relative overflow-hidden h-full">
                <span className="absolute top-3 right-4 font-headline text-[96px] leading-none text-foreground/[0.06] select-none">
                  {card.step}
                </span>
                <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40 block mb-1">{card.label}</span>
                <h3 className="font-headline text-lg font-bold mb-5">{card.title}</h3>
                <card.Visual />
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);
