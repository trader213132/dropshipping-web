"use server";

import { requireAuth } from "@/server/auth/session";
import { createWorkspace } from "@/server/workspace";
import { audit } from "@/server/audit";
import { redirect } from "next/navigation";
import { z } from "zod";

const schema = z.object({
  workspaceName: z.string().min(2, "Name must be at least 2 characters").max(80),
});

export type OnboardingState = {
  error?: string;
  fieldErrors?: Partial<Record<"workspaceName", string>>;
};

export async function createWorkspaceAction(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const user = await requireAuth();

  const parsed = schema.safeParse({ workspaceName: formData.get("workspaceName") });
  if (!parsed.success) {
    return { fieldErrors: { workspaceName: parsed.error.flatten().fieldErrors.workspaceName?.[0] } };
  }

  const workspace = await createWorkspace({
    name: parsed.data.workspaceName,
    userId: user.id,
  });

  await audit({
    action: "workspace.created",
    userId: user.id,
    workspaceId: workspace.id,
    metadata: { name: workspace.name, slug: workspace.slug },
  });

  redirect(`/app/${workspace.slug}/dashboard`);
}
