import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { SettingsForm } from "./settings-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decrypt, maskKey } from "@/lib/encryption";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { apiKey: true },
  });

  let masked: string | null = null;
  if (user?.apiKey) {
    try {
      masked = maskKey(decrypt(user.apiKey));
    } catch {
      masked = "(corrupted — please re-enter)";
    }
  }

  const appKeyConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
  const activeSource: "user" | "app" | "none" = masked
    ? "user"
    : appKeyConfigured
      ? "app"
      : "none";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage the Anthropic API key used for your chats.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Anthropic API key</h2>
          <ActiveBadge source={activeSource} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Your key is encrypted with AES-256-GCM at rest and never returned to the
          browser after save. Get a key at{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand underline underline-offset-2"
          >
            console.anthropic.com
          </a>
          .
        </p>

        <div className="mt-4">
          <SettingsForm hasKey={Boolean(masked)} maskedKey={masked} />
        </div>

        <div className="mt-4 rounded-md border border-border/70 bg-muted/30 p-3 text-xs text-muted-foreground">
          <div className="font-medium text-foreground">How the active key is chosen</div>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>If you've saved a personal key above, it's used.</li>
            <li>Otherwise, the app-level <code className="font-mono">ANTHROPIC_API_KEY</code> env var is used.</li>
            <li>If neither is set, chat requests will fail with a clear error.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function ActiveBadge({ source }: { source: "user" | "app" | "none" }) {
  const styles = {
    user: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
    app: "bg-amber-500/15 text-amber-700 border-amber-500/30",
    none: "bg-destructive/15 text-destructive border-destructive/30",
  } as const;
  const label = {
    user: "Active: your key",
    app: "Active: app fallback",
    none: "No key configured",
  } as const;
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${styles[source]}`}>
      {label[source]}
    </span>
  );
}
