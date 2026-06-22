"use client";

import { useActionState, startTransition, useState } from "react";
import { UserPlus, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { inviteMemberAction } from "../actions";
import { toast } from "sonner";

export function InviteMemberDialog({ workspaceSlug }: { workspaceSlug: string }) {
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: Parameters<typeof inviteMemberAction>[1], fd: FormData) =>
      inviteMemberAction(workspaceSlug, prev, fd),
    {},
  );

  async function copyLink() {
    if (state.inviteUrl) {
      await navigator.clipboard.writeText(state.inviteUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-1.5 h-4 w-4" />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>
            Send an invitation link to add someone to this workspace.
          </DialogDescription>
        </DialogHeader>

        {state.inviteUrl ? (
          <div className="space-y-4 mt-2">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 dark:bg-emerald-950/20 dark:border-emerald-800">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-2">
                Invitation created
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-500 break-all">
                {state.inviteUrl}
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={copyLink}>
              {copied ? (
                <><Check className="mr-1.5 h-4 w-4 text-emerald-500" />Copied!</>
              ) : (
                <><Copy className="mr-1.5 h-4 w-4" />Copy invite link</>
              )}
            </Button>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Share this link with the person you&apos;re inviting. It expires in 7 days.
            </p>
          </div>
        ) : (
          <form action={(fd) => startTransition(() => action(fd))} className="space-y-4 mt-2">
            {state.error && (
              <div role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.error}
              </div>
            )}
            <FormField
              label="Email address"
              name="email"
              type="email"
              placeholder="colleague@example.com"
              required
            />
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                name="role"
                defaultValue="MEMBER"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="ADMIN">Admin — full access</option>
                <option value="MEMBER">Member — standard access</option>
                <option value="ANALYST">Analyst — view + analyse</option>
                <option value="DESIGNER">Designer — brand + design</option>
                <option value="CLIENT_READONLY">Client — read only</option>
              </select>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="forge" disabled={pending} isLoading={pending}>
                {pending ? "Sending…" : "Send invitation"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
