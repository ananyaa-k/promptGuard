import { motion } from "framer-motion";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
} as const;

const faqs = [
  {
    q: "Is my system prompt stored?",
    a: "No. Prompts processed in memory, discarded after analysis. Nothing logged or retained.",
  },
  {
    q: "Which AI models does this work with?",
    a: "Any LLM with a system prompt — OpenAI, Anthropic, Google, Mistral, Llama, custom.",
  },
  {
    q: "How is this different from reading OWASP documentation?",
    a: "Reading about attacks and running them are different. PromptGuard executes the tests and gives actual results against your specific prompt — not generic theory.",
  },
  {
    q: "When does PromptGuard launch?",
    a: "Soon. Join the waitlist above to be notified first.",
  },
];

export const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-background-mid py-28 px-6">
      <div className="max-w-[680px] mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.h2 variants={fadeUp} className="font-headline text-3xl md:text-[42px] font-bold tracking-tight mb-12">Questions.</motion.h2>

          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left flex items-center justify-between py-5 px-4 glass-soft rounded-lg transition-all"
                >
                  <span className="font-body text-foreground pr-4">{faq.q}</span>
                  <span
                    className={`text-foreground/40 text-lg transition-transform duration-300 flex-shrink-0 ${open === i ? "rotate-90" : ""}`}
                  >
                    ›
                  </span>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: open === i ? "200px" : "0px" }}
                >
                  <p className="px-4 py-4 font-body text-foreground/50 leading-[1.7]">{faq.a}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
