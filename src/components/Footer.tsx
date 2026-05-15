export const Footer = () => (
  <footer className="border-t border-foreground/[0.06] px-6 py-8">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="font-ui text-sm font-medium text-foreground">PromptGuard</span>
        <span className="font-body text-sm text-foreground/25">Find it before they do.</span>
      </div>

      <span className="font-body text-xs text-foreground/20 md:hidden">For authorized security testing only.</span>

      <div className="flex items-center gap-6">
        <a
          href="https://github.com/ananyaa-k"
          target="_blank"
          rel="noopener noreferrer"
          className="font-ui text-xs uppercase tracking-wide text-foreground/40 hover:text-foreground transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/ananyaa-k"
          target="_blank"
          rel="noopener noreferrer"
          className="font-ui text-xs uppercase tracking-wide text-foreground/40 hover:text-foreground transition-colors"
        >
          LinkedIn
        </a>
      </div>
    </div>
    <p className="hidden md:block text-center font-body text-xs text-foreground/20 mt-4">For authorized security testing only.</p>
  </footer>
);
