import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { OrdersKanban } from "@/components/admin/orders-kanban"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { Profile, ServiceOrder } from "@/types/database"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: orders } = await supabase
    .from("service_orders")
    .select(`*, customer:customers(*), technician:profiles(*)`)
    .order("created_at", { ascending: false })

  return (
    <div>
      <AdminHeader
        user={profile as Profile | null}
        title="Ordens de Serviço"
        subtitle="Gerencie os reparos em andamento"
      />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/admin/orders/new">
                <Plus className="w-4 h-4 mr-2" />
                Nova OS
              </Link>
            </Button>
          </div>
        </div>

        <OrdersKanban orders={(orders as ServiceOrder[]) || []} />
      </div>
    </div>
  )
}
