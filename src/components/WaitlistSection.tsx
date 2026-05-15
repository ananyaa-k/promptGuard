import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
} as const;

export const WaitlistSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const { count: c } = await supabase.from("waitlist").select("*", { count: "exact", head: true });
      if (c !== null) setCount(c);
    };
    fetchCount();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    const { error } = await supabase.from("waitlist").insert({ email: email.trim().toLowerCase() });

    if (error) {
      if (error.code === "23505") {
        setStatus("duplicate");
      } else {
        setStatus("error");
      }
    } else {
      setStatus("success");
      setCount((c) => (c !== null ? c + 1 : 1));
    }
  };

  return (
    <section id="waitlist" className="py-28 px-6 relative">
      <div className="absolute inset-0 waitlist-glow pointer-events-none" />
      <div className="max-w-[600px] mx-auto relative z-10">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} variants={{ show: { transition: { staggerChildren: 0.1 } } }}>
          <motion.div variants={fadeUp} className="glass-strong rounded-xl p-8 md:p-10">
            {status === "success" ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full border-2 border-foreground mx-auto mb-6 flex items-center justify-center">
                  <span className="text-foreground text-2xl">✓</span>
                </div>
                <h3 className="font-headline text-[28px] font-bold">You're on the list.</h3>
              </div>
            ) : (
              <>
                <span className="font-ui text-[11px] uppercase tracking-[0.2em] text-foreground/40 block mb-3">Early Access</span>
                <h2 className="font-headline text-4xl md:text-[52px] font-bold tracking-tight mb-4">Be first.</h2>
                <p className="font-body text-foreground/50 leading-[1.7] mb-8">
                  PromptGuard is in private development. Join the waitlist for early access and a free scan on launch day.
                </p>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (status === "duplicate" || status === "error") setStatus("idle"); }}
                    placeholder="you@company.com"
                    className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-4 font-body text-foreground placeholder:text-foreground/25 focus:border-foreground/30 focus:shadow-[0_0_20px_rgba(255,255,255,0.05)] focus:outline-none transition-all"
                  />
                  {status === "duplicate" && (
                    <p className="font-body text-sm text-foreground/60">This email is already on the list.</p>
                  )}
                  {status === "error" && (
                    <p className="font-body text-sm text-foreground/60">Something went wrong. Try again.</p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full bg-foreground text-primary-foreground font-ui text-sm font-medium uppercase tracking-wide rounded-xl px-4 py-4 transition-all duration-200 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {status === "loading" ? "Joining..." : "Join Waitlist"}
                  </button>
                </form>
                {count !== null && (
                  <p className="font-ui text-xs uppercase tracking-[0.2em] text-foreground/25 text-center mt-6">
                    — {count} researchers and founders already waiting —
                  </p>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
