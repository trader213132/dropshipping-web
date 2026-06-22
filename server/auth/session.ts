import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
};

export async function requireAuth(): Promise<AuthUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: session.user.role ?? "USER",
  };
}

export async function getOptionalAuth(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    image: session.user.image ?? null,
    role: session.user.role ?? "USER",
  };
}
