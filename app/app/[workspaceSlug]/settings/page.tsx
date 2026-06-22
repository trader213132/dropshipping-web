import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { hasRole } from "@/server/permissions";
import { getPendingInvitations } from "@/server/invitations";
import { getApiKeys } from "@/server/api-keys";
import { db } from "@/lib/db";
import type { WorkspaceRole } from "@prisma/client";
import { Settings, Users, Key, Shield, Flag } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/ui/form-field";
import { TeamMembers } from "./_components/team-members";
import { InviteMemberDialog } from "./_components/invite-member-dialog";
import { ApiKeysSection } from "./_components/api-keys-section";
import { FeatureFlagsSection } from "./_components/feature-flags-section";
import { updateWorkspaceAction } from "./actions";
import { getAllFlagsForWorkspace } from "@/server/feature-flags";

export const metadata: Metadata = { title: "Settings" };

const PLAN_BADGE: Record<string, "default" | "secondary" | "success"> = {
  FREE: "secondary",
  STARTER: "secondary",
  GROWTH: "default",
  ENTERPRISE: "success",
};

interface Props {
  params: Promise<{ workspaceSlug: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ params, searchParams }: Props) {
  const { workspaceSlug } = await params;
  const sp = searchParams ? await searchParams : {};
  const activeTab = sp.tab ?? "general";

  const user = await requireAuth();
  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace, membership } = result;
  const isAdmin = hasRole(membership.role as WorkspaceRole, "ADMIN");
  const isOwner = membership.role === "OWNER";

  const [members, invitations, apiKeys, featureFlags] = await Promise.all([
    db.membership.findMany({
      where: { workspaceId: workspace.id },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    }),
    getPendingInvitations(workspace.id),
    isAdmin ? getApiKeys(workspace.id) : Promise.resolve([] as Awaited<ReturnType<typeof getApiKeys>>),
    isOwner ? getAllFlagsForWorkspace(workspace.id) : Promise.resolve([]),
  ]);

  async function doUpdateWorkspace(formData: FormData) {
    "use server";
    await updateWorkspaceAction(workspaceSlug, {}, formData);
  }

  return (
    <div className="p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage {workspace.name} workspace settings and team.
          </p>
        </div>

        <Tabs defaultValue={activeTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="general" className="flex items-center gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Team
              <span className="rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs px-1.5 py-0.5 font-semibold">
                {members.length}
              </span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="api-keys" className="flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5" />
                API Keys
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="flags" className="flex items-center gap-1.5">
                <Flag className="h-3.5 w-3.5" />
                Features
              </TabsTrigger>
            )}
            {isOwner && (
              <TabsTrigger value="danger" className="flex items-center gap-1.5 text-red-500 data-[state=active]:text-red-600">
                <Shield className="h-3.5 w-3.5" />
                Danger zone
              </TabsTrigger>
            )}
          </TabsList>

          {/* General */}
          <TabsContent value="general">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Workspace info</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Slug</span>
                    <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{workspace.slug}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Plan</span>
                    <Badge variant={PLAN_BADGE[workspace.plan] ?? "secondary"} className="capitalize text-xs">
                      {workspace.plan.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Your role</span>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {membership.role.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Workspace name</h2>
                  <form action={doUpdateWorkspace} className="flex items-start gap-3">
                    <div className="flex-1">
                      <FormField
                        label=""
                        name="name"
                        defaultValue={workspace.name}
                        placeholder="Workspace name"
                        required
                      />
                    </div>
                    <Button type="submit" variant="outline" size="sm">Save</Button>
                  </form>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Team */}
          <TabsContent value="team">
            <div className="space-y-4">
              {isAdmin && (
                <div className="flex justify-end">
                  <InviteMemberDialog workspaceSlug={workspaceSlug} />
                </div>
              )}
              <TeamMembers
                workspaceSlug={workspaceSlug}
                currentUserId={user.id}
                members={members.map((m) => ({
                  id: m.id,
                  role: m.role,
                  user: { id: m.user.id, name: m.user.name, email: m.user.email },
                }))}
                invitations={invitations.map((i) => ({
                  id: i.id,
                  email: i.email,
                  role: i.role,
                  expiresAt: i.expiresAt,
                }))}
                isAdmin={isAdmin}
              />
            </div>
          </TabsContent>

          {/* API Keys */}
          {isAdmin && (
            <TabsContent value="api-keys">
              <ApiKeysSection
                workspaceSlug={workspaceSlug}
                apiKeys={apiKeys.map((k) => ({
                  id: k.id,
                  name: k.name,
                  prefix: k.prefix,
                  lastUsedAt: k.lastUsedAt,
                  expiresAt: k.expiresAt,
                  createdAt: k.createdAt,
                }))}
              />
            </TabsContent>
          )}

          {/* Feature flags */}
          {isOwner && featureFlags.length > 0 && (
            <TabsContent value="flags">
              <FeatureFlagsSection workspaceSlug={workspaceSlug} flags={featureFlags} />
            </TabsContent>
          )}

          {/* Danger zone */}
          {isOwner && (
            <TabsContent value="danger">
              <div className="rounded-2xl border border-red-200 bg-white p-6 dark:border-red-900/50 dark:bg-slate-900">
                <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Delete workspace</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Permanently deletes this workspace and all its data including products, brands, and stores. This action cannot be undone and requires contacting support.
                </p>
                <Button variant="destructive" size="sm" disabled>
                  Delete workspace (contact support)
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
