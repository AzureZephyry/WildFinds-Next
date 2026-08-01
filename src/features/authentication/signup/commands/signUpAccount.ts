import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";

export interface SignUpAccountInput {
  fullName: string;
  email: string;
  password: string;
}

export async function signUpAccount(
  input: SignUpAccountInput,
): Promise<void> {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const { error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
      },
    },
  });

  if (error) {
    throw error;
  }
}
