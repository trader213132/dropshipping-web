"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password", string>>;
};

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const raw = { email: formData.get("email"), password: formData.get("password") };
  const parsed = schema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: LoginState["fieldErrors"] = {};
    for (const [field, msgs] of Object.entries(parsed.error.flatten().fieldErrors)) {
      fieldErrors[field as keyof typeof fieldErrors] = msgs?.[0];
    }
    return { fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/app",
    });
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { error: "Incorrect email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw err;
  }

  return {};
}
