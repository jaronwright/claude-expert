"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { CodeBlock } from "./CodeBlock";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className ?? "");
            const text = String(children).replace(/\n$/, "");
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]"
                  {...props}
                >
                  {text}
                </code>
              );
            }
            return (
              <CodeBlock code={text} language={match?.[1]}>
                <code className={className}>{children}</code>
              </CodeBlock>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand underline underline-offset-2 hover:text-brand-dark"
              >
                {children}
              </a>
            );
          },
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto">
                <table className="min-w-full border-collapse text-sm">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return <th className="border-b border-border px-3 py-2 text-left font-medium">{children}</th>;
          },
          td({ children }) {
            return <td className="border-b border-border/50 px-3 py-2">{children}</td>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
