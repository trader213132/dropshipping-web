import { requireAuth } from "@/server/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireAuth();
  return <>{children}</>;
}
