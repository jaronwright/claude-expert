import { Bot, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Markdown } from "./Markdown";

export interface BubbleMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface MessageBubbleProps {
  message: BubbleMessage;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  if (message.role === "system") return null;
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex w-full animate-fadeIn gap-3 px-4 py-4 sm:px-6",
        isUser ? "bg-transparent" : "bg-muted/30",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
          isUser ? "bg-muted text-foreground" : "bg-brand text-white",
        )}
        aria-hidden
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xs font-medium text-muted-foreground">
          {isUser ? "You" : "Claude Expert"}
        </div>
        {isUser ? (
          <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {message.content}
          </div>
        ) : (
          <>
            <Markdown content={message.content} />
            {isStreaming && message.content.length === 0 ? (
              <div className="mt-1 flex gap-1">
                <span className="h-2 w-2 animate-pulseDot rounded-full bg-muted-foreground [animation-delay:0s]" />
                <span className="h-2 w-2 animate-pulseDot rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                <span className="h-2 w-2 animate-pulseDot rounded-full bg-muted-foreground [animation-delay:0.4s]" />
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
