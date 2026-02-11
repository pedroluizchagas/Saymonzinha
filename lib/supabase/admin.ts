import { createClient } from "@supabase/supabase-js"

// Cliente Supabase com service role key - bypass de RLS
// USAR APENAS NO SERVIDOR para operacoes administrativas
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Variaveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorias")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
