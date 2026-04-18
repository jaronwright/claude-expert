import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { ChatWindow } from "@/components/chat/ChatWindow";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ChatByIdPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const conversation = await prisma.conversation.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) notFound();

  const initialMessages = conversation.messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      id: m.id,
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  return (
    <ChatWindow
      conversationId={conversation.id}
      initialMessages={initialMessages}
      initialModel={conversation.model ?? undefined}
    />
  );
}
