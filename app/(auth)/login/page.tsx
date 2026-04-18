"use client";

import { Github } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";

function LoginInner() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/chat";
  const error = params.get("error");
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 text-3xl">✦</div>
          <h1 className="text-2xl font-semibold tracking-tight">Claude Expert</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Ask Claude about Claude — the models, the API, and Anthropic's research.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {error === "OAuthAccountNotLinked"
              ? "That email is already linked to another sign-in method."
              : "Sign-in failed. Please try again."}
          </div>
        ) : null}

        <Button
          onClick={() => {
            setLoading(true);
            void signIn("github", { callbackUrl });
          }}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          <Github className="h-4 w-4" />
          {loading ? "Redirecting…" : "Continue with GitHub"}
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          You'll use your own Anthropic API key (saved encrypted) or the app-level
          fallback if configured.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
