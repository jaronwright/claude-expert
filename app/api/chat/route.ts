import { streamText, type CoreMessage } from "ai";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { anthropicClient, resolveApiKey } from "@/lib/anthropic";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveModelId } from "@/lib/models";
import { CLAUDE_EXPERT_SYSTEM_PROMPT } from "@/lib/system-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ChatRequest = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      }),
    )
    .min(1),
  conversationId: z.string().optional(),
  model: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: z.infer<typeof ChatRequest>;
  try {
    body = ChatRequest.parse(await req.json());
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const keyInfo = await resolveApiKey(userId);
  if (!keyInfo) {
    return Response.json(
      {
        error:
          "No Anthropic API key configured. Add one in Settings, or ask the admin to set ANTHROPIC_API_KEY.",
      },
      { status: 400 },
    );
  }

  const modelId = resolveModelId(body.model);
  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  if (!lastUser) {
    return Response.json({ error: "No user message to respond to" }, { status: 400 });
  }

  // Resolve or create the conversation up front so we can persist messages.
  let conversationId = body.conversationId;
  const isNewConversation = !conversationId;
  if (conversationId) {
    const existing = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      select: { id: true },
    });
    if (!existing) {
      return Response.json({ error: "Conversation not found" }, { status: 404 });
    }
  } else {
    const created = await prisma.conversation.create({
      data: {
        userId,
        title: deriveTitle(lastUser.content),
        model: modelId,
      },
      select: { id: true },
    });
    conversationId = created.id;
  }

  // Persist the incoming user message.
  await prisma.message.create({
    data: {
      conversationId,
      role: "user",
      content: lastUser.content,
    },
  });

  const coreMessages: CoreMessage[] = body.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  const anthropic = anthropicClient(keyInfo.key);

  const result = await streamText({
    model: anthropic(modelId),
    system: CLAUDE_EXPERT_SYSTEM_PROMPT,
    messages: coreMessages,
    temperature: 0.4,
    maxTokens: 4096,
    onFinish: async ({ text }) => {
      try {
        await prisma.$transaction([
          prisma.message.create({
            data: {
              conversationId: conversationId!,
              role: "assistant",
              content: text,
            },
          }),
          prisma.conversation.update({
            where: { id: conversationId! },
            data: { model: modelId, updatedAt: new Date() },
          }),
        ]);
      } catch (err) {
        console.error("Failed to persist assistant message", err);
      }
    },
  });

  const response = result.toDataStreamResponse({
    getErrorMessage(error) {
      if (error instanceof Error) return error.message;
      return "Upstream model error";
    },
  });

  const headers = new Headers(response.headers);
  headers.set("x-conversation-id", conversationId);
  headers.set("x-key-source", keyInfo.source);
  if (isNewConversation) headers.set("x-new-conversation", "1");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function deriveTitle(text: string): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= 60) return trimmed;
  return `${trimmed.slice(0, 57)}…`;
}
