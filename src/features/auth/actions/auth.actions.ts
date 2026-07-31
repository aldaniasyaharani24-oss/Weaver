"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "../validation/auth.schema";
import type { LoginInput, RegisterInput } from "../validation/auth.schema";

export async function login(formData: LoginInput) {
  const validated = loginSchema.safeParse(formData);

  if (!validated.success) {
    return { error: "Data tidak valid" };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function register(formData: RegisterInput) {
  const validated = registerSchema.safeParse(formData);

  if (!validated.success) {
    return { error: "Data tidak valid" };
  }

  const supabase = await createClient();

  const { error: authError } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.full_name,
      },
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  redirect("/login");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
