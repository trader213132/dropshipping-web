import { db } from "@/lib/db";
import type { WorkspaceRole } from "@prisma/client";

const INVITATION_TTL_DAYS = 7;

export async function createInvitation(
  workspaceId: string,
  invitedById: string,
  email: string,
  role: WorkspaceRole,
) {
  const existing = await db.workspaceInvitation.findFirst({
    where: { workspaceId, email, status: "PENDING" },
  });
  if (existing) {
    // Reset expiry
    return db.workspaceInvitation.update({
      where: { id: existing.id },
      data: {
        role,
        expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * 86400_000),
      },
    });
  }
  return db.workspaceInvitation.create({
    data: {
      workspaceId,
      invitedById,
      email,
      role,
      expiresAt: new Date(Date.now() + INVITATION_TTL_DAYS * 86400_000),
    },
  });
}

export async function getInvitation(token: string) {
  return db.workspaceInvitation.findUnique({
    where: { token },
    include: { workspace: { select: { id: true, name: true, slug: true } } },
  });
}

export async function acceptInvitation(token: string, userId: string) {
  const invitation = await db.workspaceInvitation.findUnique({ where: { token } });
  if (!invitation) throw new Error("Invitation not found");
  if (invitation.status !== "PENDING") throw new Error("Invitation already used");
  if (invitation.expiresAt < new Date()) throw new Error("Invitation expired");

  await db.$transaction([
    db.membership.upsert({
      where: {
        userId_workspaceId: { userId, workspaceId: invitation.workspaceId },
      },
      create: { userId, workspaceId: invitation.workspaceId, role: invitation.role },
      update: { role: invitation.role },
    }),
    db.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  return invitation;
}

export async function getPendingInvitations(workspaceId: string) {
  return db.workspaceInvitation.findMany({
    where: { workspaceId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

export async function revokeInvitation(workspaceId: string, invitationId: string) {
  await db.workspaceInvitation.update({
    where: { id: invitationId, workspaceId },
    data: { status: "EXPIRED" },
  });
}
