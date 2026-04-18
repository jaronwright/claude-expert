"use client";

import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  isStreaming,
  placeholder = "Ask about Claude, the API, prompt caching, tool use…",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    const next = Math.min(el.scrollHeight, 200);
    el.style.height = `${next}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) onSubmit();
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto max-w-3xl px-3 py-3 sm:px-6">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border border-border bg-card p-2 pl-4",
            "focus-within:border-brand/60 focus-within:ring-1 focus-within:ring-brand/30",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent py-2 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground"
            disabled={disabled && !isStreaming}
          />
          {isStreaming && onStop ? (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={onStop}
              aria-label="Stop generating"
              className="shrink-0"
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              onClick={() => canSend && onSubmit()}
              disabled={!canSend}
              aria-label="Send message"
              className="shrink-0"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Claude can make mistakes. Verify important information against{" "}
          <a
            href="https://docs.anthropic.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            docs.anthropic.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
