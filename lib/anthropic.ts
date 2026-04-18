import { createAnthropic } from "@ai-sdk/anthropic";

import { prisma } from "@/lib/db";
import { decrypt } from "@/lib/encryption";

export type KeySource = "user" | "app";

export interface ResolvedKey {
  key: string;
  source: KeySource;
}

/**
 * Returns the Anthropic API key to use for this request. The signed-in user's
 * encrypted key takes precedence over the app-level fallback.
 */
export async function resolveApiKey(userId: string): Promise<ResolvedKey | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { apiKey: true },
  });
  if (user?.apiKey) {
    try {
      return { key: decrypt(user.apiKey), source: "user" };
    } catch {
      // Stored payload is malformed — fall through to app key rather than
      // breaking the chat. The user can re-save a key from Settings.
    }
  }
  const appKey = process.env.ANTHROPIC_API_KEY;
  if (appKey) return { key: appKey, source: "app" };
  return null;
}

/** Create a scoped Anthropic client for the AI SDK. */
export function anthropicClient(apiKey: string) {
  return createAnthropic({ apiKey });
}
