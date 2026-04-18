"use client";

import { LogOut, Menu, Plus, Settings, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ConversationList, type ConversationSummary } from "./ConversationList";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: ConversationSummary[];
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ conversations, user }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
        className="fixed left-3 top-3 z-30 rounded-md border border-border bg-background/80 p-2 backdrop-blur md:hidden"
      >
        <Menu className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-3 pt-3 pb-2">
          <Link href="/chat" className="flex items-center gap-2 px-1">
            <span className="text-lg">✦</span>
            <span className="font-semibold tracking-tight">Claude Expert</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close sidebar"
            className="rounded-md p-1 hover:bg-muted md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <Link
            href="/chat"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto border-t border-border">
          <ConversationList conversations={conversations} />
        </div>

        <div className="border-t border-border p-2">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <div className="mt-1 flex items-center gap-2 rounded-md px-2 py-2">
            {user.image ? (
              <Image
                src={user.image}
                alt=""
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="h-6 w-6 rounded-full bg-muted" />
            )}
            <div className="min-w-0 flex-1 text-xs">
              <div className="truncate font-medium">{user.name ?? "Signed in"}</div>
              <div className="truncate text-muted-foreground">{user.email}</div>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              aria-label="Sign out"
              className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
