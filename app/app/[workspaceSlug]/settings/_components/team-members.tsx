"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { removeMemberAction, revokeInvitationAction } from "../actions";

const ROLE_BADGE: Record<string, "default" | "secondary" | "outline"> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
  ANALYST: "outline",
  DESIGNER: "outline",
  CLIENT_READONLY: "outline",
};

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  expiresAt: Date;
}

interface TeamMembersProps {
  workspaceSlug: string;
  currentUserId: string;
  members: Member[];
  invitations: Invitation[];
  isAdmin: boolean;
}

export function TeamMembers({
  workspaceSlug,
  currentUserId,
  members,
  invitations,
  isAdmin,
}: TeamMembersProps) {
  const [pending, startTransition] = useTransition();

  function handleRemove(userId: string) {
    startTransition(async () => {
      await removeMemberAction(workspaceSlug, userId);
      toast.success("Member removed");
    });
  }

  function handleRevokeInvite(invId: string) {
    startTransition(async () => {
      await revokeInvitationAction(workspaceSlug, invId);
      toast.success("Invitation revoked");
    });
  }

  return (
    <div className="space-y-6">
      {/* Active members */}
      <div>
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
          Members ({members.length})
        </h3>
        <div className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {m.user.name ?? m.user.email}
                  {m.user.id === currentUserId && (
                    <span className="ml-1.5 text-xs text-slate-400">(you)</span>
                  )}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={ROLE_BADGE[m.role] ?? "outline"} className="capitalize text-xs">
                  {m.role.toLowerCase().replace("_", " ")}
                </Badge>
                {isAdmin && m.role !== "OWNER" && m.user.id !== currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => handleRemove(m.user.id)}
                    disabled={pending}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending invitations */}
      {invitations.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Pending invitations ({invitations.length})
          </h3>
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">{inv.email}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="capitalize text-xs">
                    {inv.role.toLowerCase().replace("_", " ")}
                  </Badge>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-slate-400 hover:text-red-500"
                      onClick={() => handleRevokeInvite(inv.id)}
                      disabled={pending}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
