import { redirect } from "next/navigation";
import { requireAuth } from "@/server/auth/session";
import { getUserWorkspaces } from "@/server/workspace";

export default async function AppRootPage() {
  const user = await requireAuth();
  const workspaces = await getUserWorkspaces(user.id);

  if (workspaces.length === 0) {
    redirect("/app/onboarding");
  }

  const first = workspaces[0]!;
  redirect(`/app/${first.slug}/dashboard`);
}
