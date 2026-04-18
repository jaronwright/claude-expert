import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true },
    take: 100,
  });

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar
        conversations={conversations.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: c.updatedAt.toISOString(),
        }))}
        user={{
          name: session.user.name ?? null,
          email: session.user.email ?? null,
          image: session.user.image ?? null,
        }}
      />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
