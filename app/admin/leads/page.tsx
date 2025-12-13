import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { LeadsTable } from "@/components/admin/leads-table"
import type { Profile, Lead } from "@/types/database"

export default async function LeadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

  return (
    <div>
      <AdminHeader
        user={profile as Profile | null}
        title="Leads / Pré-Orçamentos"
        subtitle="Gerencie os orçamentos recebidos pelo site"
      />

      <div className="p-6">
        <LeadsTable leads={(leads as Lead[]) || []} />
      </div>
    </div>
  )
}
