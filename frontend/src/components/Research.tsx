import { motion } from "framer-motion";
import { TiltCard } from "./TiltCard";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
} as const;

export const Research = () => (
  <section id="research" className="bg-background-mid py-28 px-6">
    <div className="max-w-[720px] mx-auto">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
        <motion.span variants={fadeUp} className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40 block mb-3">Further Reading</motion.span>
        <motion.h2 variants={fadeUp} className="font-headline text-3xl md:text-[42px] font-bold tracking-tight mb-10">The research behind PromptGuard.</motion.h2>

        <motion.div variants={fadeUp}>
          <TiltCard className="p-8">
            <p className="font-body text-foreground/50 leading-[1.7] mb-6">
              The attack library is built on publicly available security research, CTF findings, and OWASP LLM documentation.
            </p>
            <div className="space-y-3">
              <a
                href="https://owasp.org/www-project-top-10-for-large-language-model-applications/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui text-sm uppercase tracking-wide text-foreground/60 hover:text-foreground transition-colors block"
              >
                → OWASP LLM Top 10 Project
              </a>
              <a
                href="https://github.com/ananyaa-k"
                target="_blank"
                rel="noopener noreferrer"
                className="font-ui text-sm uppercase tracking-wide text-foreground/60 hover:text-foreground transition-colors block"
              >
                → View on GitHub
              </a>
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>
    </div>
  </section>
);
