import { notFound } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { requireWorkspaceMembership } from "@/server/workspace";
import { AppSidebar } from "./_components/app-sidebar";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}

export default async function WorkspaceLayout({ children, params }: WorkspaceLayoutProps) {
  const { workspaceSlug } = await params;
  const user = await requireAuth();

  const result = await requireWorkspaceMembership(user.id, workspaceSlug);
  if (!result) notFound();

  const { workspace } = result;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <AppSidebar
        workspaceName={workspace.name}
        workspaceSlug={workspace.slug}
        userName={user.name}
        userEmail={user.email}
        userImage={user.image}
      />
      <main id="main-content" className="flex flex-1 flex-col overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
