// lib/auth.ts
"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function signUp(email: string, password: string, fullName: string, role: string) {
  const supabase = createServerActionClient({ cookies });

  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Insert into profiles table
  if (data.user) {
    const { error: profileErr } = await supabase
      .from("profiles")
      .insert([
        {
          id: data.user.id,
          full_name: fullName,
          role,
        },
      ]);
    if (profileErr) throw profileErr;
  }

  return data.user;
}
