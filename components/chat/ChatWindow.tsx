"use client";

import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { ChatInput } from "./ChatInput";
import { MessageBubble, type BubbleMessage } from "./MessageBubble";
import { SuggestedQuestions } from "./SuggestedQuestions";
import { DEFAULT_MODEL, MODELS, type ModelKey } from "@/lib/models";

interface InitialMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatWindowProps {
  conversationId?: string;
  initialMessages?: InitialMessage[];
  initialModel?: string;
}

export function ChatWindow({
  conversationId,
  initialMessages,
  initialModel,
}: ChatWindowProps) {
  const router = useRouter();
  const [convId, setConvId] = useState<string | undefined>(conversationId);
  const [model, setModel] = useState<ModelKey>(() => pickModelKey(initialModel));
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    stop,
    error,
    append,
  } = useChat({
    api: "/api/chat",
    initialMessages: initialMessages?.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
    })),
    body: useMemo(() => ({
      conversationId: convId,
      model: MODELS[model].id,
    }), [convId, model]),
    onResponse(response) {
      const newId = response.headers.get("x-conversation-id");
      if (newId && newId !== convId) {
        setConvId(newId);
        window.history.replaceState(null, "", `/chat/${newId}`);
      }
    },
    onFinish() {
      router.refresh();
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const bubbleMessages: BubbleMessage[] = messages.map((m) => ({
    id: m.id,
    role: m.role === "user" ? "user" : m.role === "assistant" ? "assistant" : "system",
    content: m.content,
  }));

  const showSuggestions = bubbleMessages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 sm:px-6">
        <div className="text-sm font-medium text-muted-foreground">Claude Expert</div>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value as ModelKey)}
          className="rounded-md border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand"
          aria-label="Model"
        >
          {(Object.keys(MODELS) as ModelKey[]).map((k) => (
            <option key={k} value={k}>
              {MODELS[k].label}
            </option>
          ))}
        </select>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {showSuggestions ? (
          <div className="flex h-full flex-col">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pt-8 text-center sm:px-6">
              <div className="mb-2 text-4xl">✦</div>
              <h1 className="text-2xl font-semibold tracking-tight">Ask Claude Expert</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                A Claude-powered assistant that knows Anthropic's models, API, research, and
                prompting patterns. Try one of these:
              </p>
            </div>
            <SuggestedQuestions
              onPick={(prompt) => {
                void append({ role: "user", content: prompt });
              }}
            />
          </div>
        ) : (
          <div className="mx-auto w-full max-w-3xl">
            {bubbleMessages.map((m, i) => (
              <MessageBubble
                key={m.id}
                message={m}
                isStreaming={isLoading && i === bubbleMessages.length - 1 && m.role === "assistant"}
              />
            ))}
            {error ? (
              <div className="mx-4 my-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive sm:mx-6">
                {error.message || "Something went wrong generating a response."}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={() => handleSubmit()}
        onStop={stop}
        isStreaming={isLoading}
        disabled={isLoading}
      />
    </div>
  );
}

function pickModelKey(id: string | null | undefined): ModelKey {
  const entry = (Object.entries(MODELS) as [ModelKey, (typeof MODELS)[ModelKey]][]).find(
    ([, m]) => m.id === id,
  );
  return entry ? entry[0] : DEFAULT_MODEL;
}
