"use server";

import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export type SignupState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string>>;
};

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: SignupState["fieldErrors"] = {};
    for (const [field, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = msgs?.[0];
    }
    return { fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { fieldErrors: { email: "An account with this email already exists." } };
  }

  const passwordHash = await hashPassword(password);
  await db.user.create({ data: { name, email, passwordHash } });

  try {
    await signIn("credentials", { email, password, redirectTo: "/app" });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created but sign-in failed. Please sign in manually." };
    }
    throw err;
  }

  return {};
}
