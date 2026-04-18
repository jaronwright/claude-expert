"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
  children?: React.ReactNode;
}

export function CodeBlock({ code, language, className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard denied — silently ignore; the code is still visible.
    }
  };

  return (
    <div className={cn("group relative my-3 overflow-hidden rounded-md border border-border bg-[#0b0b0d]", className)}>
      <div className="flex items-center justify-between border-b border-border/50 bg-black/30 px-3 py-1.5">
        <span className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
          {language ?? "text"}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-white/5 hover:text-white"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        {children ?? <code>{code}</code>}
      </pre>
    </div>
  );
}
