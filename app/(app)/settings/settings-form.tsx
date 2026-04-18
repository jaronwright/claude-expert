"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SettingsFormProps {
  hasKey: boolean;
  maskedKey: string | null;
}

export function SettingsForm({ hasKey, maskedKey }: SettingsFormProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/settings/api-key", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ apiKey: value.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Failed to save key.");
        return;
      }
      setStatus("success");
      setMessage("Saved. Your key is now active.");
      setValue("");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  const onRemove = async () => {
    setStatus("saving");
    setMessage(null);
    try {
      const res = await fetch("/api/settings/api-key", { method: "DELETE" });
      if (!res.ok) {
        setStatus("error");
        setMessage("Failed to remove key.");
        return;
      }
      setStatus("success");
      setMessage("Removed. The app-level fallback (if any) will be used.");
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      {hasKey ? (
        <div className="rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
          {maskedKey}
        </div>
      ) : null}

      <form onSubmit={onSave} className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="sk-ant-api03-…"
          autoComplete="off"
          spellCheck={false}
          aria-label="Anthropic API key"
          className="font-mono"
        />
        <Button type="submit" disabled={status === "saving" || !value.trim()}>
          {status === "saving" ? "Saving…" : hasKey ? "Replace" : "Save"}
        </Button>
      </form>

      {hasKey ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          disabled={status === "saving"}
        >
          Remove key
        </Button>
      ) : null}

      {message ? (
        <p
          className={
            status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-emerald-600"
          }
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
