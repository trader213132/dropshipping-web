import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { auth } from "@/lib/auth";
import { getInvitation, acceptInvitation } from "@/server/invitations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Accept invitation" };

interface Props {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const session = await auth();
  const invitation = await getInvitation(token);

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl border border-red-200 bg-white p-8 max-w-md w-full text-center dark:border-red-900/50 dark:bg-slate-900">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Invalid invitation</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This invitation link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.status !== "PENDING" || new Date(invitation.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl border border-amber-200 bg-white p-8 max-w-md w-full text-center dark:border-amber-800 dark:bg-slate-900">
          <Clock className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Invitation expired</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            This invitation has already been used or has expired. Ask the workspace admin to send a new one.
          </p>
          <Link href={"/" as Route}>
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    const callbackUrl = encodeURIComponent(`/invite/${token}`);
    redirect(`/login?callbackUrl=${callbackUrl}` as Route);
  }

  // Accept the invitation
  try {
    await acceptInvitation(token, session.user.id);
    redirect(`/app/${invitation.workspace.slug}` as Route);
  } catch {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 max-w-md w-full text-center dark:border-slate-800 dark:bg-slate-900">
          <CheckCircle2 className="h-10 w-10 text-violet-500 mx-auto mb-3" />
          <h1 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            You&apos;re already a member
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            You already have access to{" "}
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {invitation.workspace.name}
            </span>.
          </p>
          <Badge variant="outline" className="mb-4">
            {invitation.role.toLowerCase().replace("_", " ")}
          </Badge>
          <div className="mt-2">
            <Link href={`/app/${invitation.workspace.slug}` as Route}>
              <Button variant="forge">Go to workspace</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
