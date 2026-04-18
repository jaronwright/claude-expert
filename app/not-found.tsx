import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-semibold">404</h1>
      <p className="text-sm text-muted-foreground">
        That page doesn't exist.
      </p>
      <Button asChild>
        <Link href="/chat">Back to chat</Link>
      </Button>
    </div>
  );
}
