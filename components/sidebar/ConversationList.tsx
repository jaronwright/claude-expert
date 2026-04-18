"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

interface ConversationListProps {
  conversations: ConversationSummary[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        if (pathname === `/chat/${id}`) {
          router.push("/chat");
        } else {
          router.refresh();
        }
      } finally {
        setDeletingId(null);
      }
    });
  };

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-4 text-xs text-muted-foreground">
        No conversations yet.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 px-2 py-2">
      {conversations.map((c) => {
        const active = pathname === `/chat/${c.id}`;
        return (
          <li key={c.id} className="group relative">
            <Link
              href={`/chat/${c.id}`}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-foreground transition-colors",
                active ? "bg-muted" : "hover:bg-muted/60",
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{c.title}</span>
            </Link>
            <button
              type="button"
              onClick={() => onDelete(c.id)}
              disabled={pending && deletingId === c.id}
              aria-label={`Delete ${c.title}`}
              className={cn(
                "absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-destructive",
                "group-hover:opacity-100 focus-visible:opacity-100",
                pending && deletingId === c.id && "opacity-100",
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
