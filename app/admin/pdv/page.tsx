import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { PDVInterface } from "@/components/admin/pdv-interface"
import type { Profile, PaymentMethod, Product } from "@/types/database"

export default async function PDVPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: paymentMethods } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("name")

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .gt("stock_quantity", 0)
    .order("name")

  return (
    <div>
      <AdminHeader user={profile as Profile | null} title="PDV" subtitle="Frente de caixa · venda no balcão" />

      <div className="px-4 pb-6 md:px-8">
        <PDVInterface
          paymentMethods={(paymentMethods as PaymentMethod[]) || []}
          products={(products as Product[]) || []}
        />
      </div>
    </div>
  )
}
