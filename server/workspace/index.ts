import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { WorkspaceRole } from "@prisma/client";

export async function createWorkspace({
  name,
  userId,
}: {
  name: string;
  userId: string;
}) {
  const baseSlug = slugify(name) || "workspace";

  let slug = baseSlug;
  let attempt = 1;
  while (await db.workspace.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${attempt++}`;
  }

  return db.workspace.create({
    data: {
      name,
      slug,
      memberships: {
        create: { userId, role: "OWNER" satisfies WorkspaceRole },
      },
    },
    include: { memberships: { select: { role: true } } },
  });
}

export async function getUserWorkspaces(userId: string) {
  return db.workspace.findMany({
    where: { memberships: { some: { userId } } },
    include: {
      memberships: {
        where: { userId },
        select: { role: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getWorkspaceBySlug(slug: string) {
  return db.workspace.findUnique({ where: { slug } });
}

export async function getUserMembership(userId: string, workspaceId: string) {
  return db.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
    include: { workspace: true },
  });
}

export async function requireWorkspaceMembership(userId: string, workspaceSlug: string) {
  const workspace = await db.workspace.findUnique({ where: { slug: workspaceSlug } });
  if (!workspace) return null;

  const membership = await db.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId: workspace.id } },
  });
  if (!membership) return null;

  return { workspace, membership };
}
