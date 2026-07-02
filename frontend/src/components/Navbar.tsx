import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const navLinks = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Attack Surface", href: "#attack-surface" },
  { label: "Research", href: "#research" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6 lg:px-10 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-[20px]" : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-foreground flex items-center justify-center">
          <span className="font-ui text-xs font-bold text-primary-foreground leading-none">PG</span>
        </div>
        <span className="font-ui text-sm font-medium text-foreground tracking-wide">PromptGuard</span>
      </div>

      {/* Center pill nav — hidden on mobile */}
      <div className="hidden md:flex glass-soft rounded-full px-1.5 py-1.5">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="font-ui text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-4 py-1.5"
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* CTA */}
      <a
        href="#demo"
        className="font-ui text-xs uppercase tracking-wide font-medium bg-foreground text-primary-foreground rounded-full px-6 py-2.5 transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:-translate-y-0.5"
      >
        Try Demo
      </a>
    </motion.nav>
  );
};
