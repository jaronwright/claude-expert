import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { encrypt } from "@/lib/encryption";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SaveKey = z.object({
  apiKey: z
    .string()
    .trim()
    .min(20, "API key looks too short.")
    .max(200, "API key looks too long.")
    .regex(/^sk-ant-/i, "Expected an Anthropic key beginning with sk-ant-."),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: z.infer<typeof SaveKey>;
  try {
    body = SaveKey.parse(await req.json());
  } catch (err) {
    const message =
      err instanceof z.ZodError
        ? (err.issues[0]?.message ?? "Invalid API key.")
        : "Invalid request body.";
    return Response.json({ error: message }, { status: 400 });
  }

  try {
    const encrypted = encrypt(body.apiKey);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { apiKey: encrypted },
    });
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save key.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { apiKey: null },
  });

  return Response.json({ ok: true });
}
