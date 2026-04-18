"use client";

import {
  Braces,
  Cpu,
  Database,
  Lightbulb,
  Radio,
  Wrench,
} from "lucide-react";

const SUGGESTIONS: Array<{
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  prompt: string;
}> = [
  {
    icon: Database,
    title: "How does prompt caching work?",
    prompt:
      "How does prompt caching work in the Anthropic API? Show me a TypeScript example with a cached system prompt.",
  },
  {
    icon: Cpu,
    title: "Opus vs Sonnet vs Haiku — when?",
    prompt:
      "What are the tradeoffs between Opus, Sonnet, and Haiku? Give me a rule of thumb for choosing.",
  },
  {
    icon: Wrench,
    title: "Show me a tool use example in Python",
    prompt:
      "Show me a complete tool use example in Python with the anthropic SDK. Define a tool, handle the tool_use block, return a tool_result, and continue the conversation.",
  },
  {
    icon: Radio,
    title: "How do I stream responses from the API?",
    prompt:
      "How do I stream responses from the Anthropic API in TypeScript? Show me the minimal streaming example.",
  },
  {
    icon: Lightbulb,
    title: "What is Constitutional AI?",
    prompt:
      "Explain Constitutional AI in a way that's useful for a working engineer. What problem does it solve and how does it differ from plain RLHF?",
  },
  {
    icon: Braces,
    title: "How do I use extended thinking mode?",
    prompt:
      "How do I use extended thinking mode on Claude? Show me a TypeScript example with a budget and explain when it helps.",
  },
];

interface SuggestedQuestionsProps {
  onPick: (prompt: string) => void;
}

export function SuggestedQuestions({ onPick }: SuggestedQuestionsProps) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 sm:px-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
          <button
            key={title}
            type="button"
            onClick={() => onPick(prompt)}
            className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left transition-colors hover:border-brand/40 hover:bg-muted/50"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span className="text-sm text-foreground">{title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
