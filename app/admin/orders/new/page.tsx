import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { NewOrderForm } from "@/components/admin/new-order-form"
import type { Profile, ProblemType, Lead } from "@/types/database"

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ lead?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: problemTypes } = await supabase.from("problem_types").select("*").eq("is_active", true)

  // Se vier de um lead, buscar dados
  let leadData: Lead | null = null
  if (params.lead) {
    const { data } = await supabase.from("leads").select("*").eq("id", params.lead).single()
    leadData = data as Lead | null
  }

  return (
    <div>
      <AdminHeader
        user={profile as Profile | null}
        title="Nova Ordem de Serviço"
        subtitle="Cadastre uma nova OS no sistema"
      />

      <div className="p-6">
        <NewOrderForm problemTypes={(problemTypes as ProblemType[]) || []} leadData={leadData} />
      </div>
    </div>
  )
}
