import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // lay cac bien moi truong
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // dam bao cac bien moi truong duoc dinh nghia
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase URL and Anon Key must be defined in environment variables"
    );
  }

  // tao va tra ve client supabase
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
