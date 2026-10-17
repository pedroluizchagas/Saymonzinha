import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { ProductsList } from "@/components/admin/products-list"
import type { Profile, Product } from "@/types/database"

export default async function ProductsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: products } = await supabase.from("products").select("*").order("name")

  return (
    <div>
      <AdminHeader user={profile as Profile | null} title="Produtos" subtitle="O estoque e o que está na loja virtual" />

      <div className="px-4 pb-6 md:px-8">
        <ProductsList products={(products as Product[]) || []} />
      </div>
    </div>
  )
}
