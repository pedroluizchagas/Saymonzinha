import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Profile, ServiceOrder } from "@/types/database"
import { OrderChecklistForm } from "@/components/admin/order-checklist-form"
import { ServiceNote } from "@/components/admin/service-note"
import { OrderItemsForm } from "@/components/admin/order-items-form"

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: order } = await supabase
    .from("service_orders")
    .select(
      `*, customer:customers(*), technician:profiles(*), problem_type:problem_types(*), items:service_order_items(*, product:products(*))`,
    )
    .eq("id", id)
    .single()

  if (!order) {
    notFound()
  }

  const o = order as ServiceOrder

  const statusLabel = {
    lead: { label: "Lead", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    awaiting_device: { label: "Aguardando Aparelho", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    in_analysis: { label: "Em Análise", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    awaiting_approval: { label: "Aguardando Aprovação", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    in_repair: { label: "Em Reparo", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    ready: { label: "Pronto para Entrega", color: "bg-green-500/10 text-green-500 border-green-500/20" },
    delivered: { label: "Finalizado", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    cancelled: { label: "Cancelado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
  }[o.status]

  return (
    <div>
      <AdminHeader
        user={profile as Profile | null}
        title={`OS #${o.order_number}`}
        subtitle="Detalhes da Ordem de Serviço"
      />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={statusLabel.color}>
            {statusLabel.label}
          </Badge>
          <Button asChild variant="outline" className="bg-transparent">
            <Link href="/admin/orders">Voltar</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Informações do Aparelho</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Marca</p>
                  <p className="text-foreground">{o.device_brand}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modelo</p>
                  <p className="text-foreground">{o.device_model}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cor</p>
                  <p className="text-foreground">{o.device_color || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">IMEI</p>
                  <p className="text-foreground">{o.device_imei || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Senha</p>
                  <p className="text-foreground">{o.device_password || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo de Entrega</p>
                  <p className="text-foreground">
                    {o.delivery_type === "store" ? "Na Loja" : "Entrega"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Endereço de Entrega</p>
                  <p className="text-foreground">{o.delivery_address || "-"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Problema</p>
                <p className="text-foreground">{o.problem_description}</p>
                {o.problem_type?.name && (
                  <p className="text-muted-foreground text-sm">Tipo: {o.problem_type.name}</p>
                )}
              </div>
              {o.diagnosis && (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Diagnóstico</p>
                  <p className="text-foreground">{o.diagnosis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="text-foreground">{o.customer?.name || "Cliente"}</p>
              <p className="text-muted-foreground">{o.customer?.phone || "-"}</p>
              <p className="text-muted-foreground">{o.customer?.email || "-"}</p>
              {o.customer?.address && <p className="text-muted-foreground">{o.customer.address}</p>}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Valores</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Estimado</p>
                <p className="text-foreground">
                  {o.estimated_price != null ? `R$ ${o.estimated_price.toFixed(2)}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Final</p>
                <p className="text-foreground">
                  {o.final_price != null ? `R$ ${o.final_price.toFixed(2)}` : "-"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-muted-foreground">Custo de Peças</p>
                <p className="text-foreground">
                  {o.parts_cost != null ? `R$ ${o.parts_cost.toFixed(2)}` : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">Checklist de Entrada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Liga</p>
                  <p className="text-foreground">
                    {o.entry_checklist?.turns_on === true ? "Sim" : o.entry_checklist?.turns_on === false ? "Não" : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Touch</p>
                  <p className="text-foreground">
                    {o.entry_checklist?.touch_works === true
                      ? "Funciona"
                      : o.entry_checklist?.touch_works === false
                      ? "Não funciona"
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Câmeras</p>
                  <p className="text-foreground">
                    {o.entry_checklist?.cameras_work === true
                      ? "Funcionam"
                      : o.entry_checklist?.cameras_work === false
                      ? "Não funcionam"
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Botões</p>
                  <p className="text-foreground">
                    {o.entry_checklist?.buttons_work === true
                      ? "Funcionam"
                      : o.entry_checklist?.buttons_work === false
                      ? "Não funcionam"
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Carregamento</p>
                  <p className="text-foreground">
                    {o.entry_checklist?.charging_port_ok === true
                      ? "OK"
                      : o.entry_checklist?.charging_port_ok === false
                      ? "Com problema"
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Som</p>
                  <p className="text-foreground">
                    {o.entry_checklist?.speakers_ok === true
                      ? "OK"
                      : o.entry_checklist?.speakers_ok === false
                      ? "Com problema"
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Microfone</p>
                  <p className="text-foreground">
                    {o.entry_checklist?.microphone_ok === true
                      ? "OK"
                      : o.entry_checklist?.microphone_ok === false
                      ? "Com problema"
                      : "-"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Danos físicos</p>
                  <p className="text-foreground">{o.entry_checklist?.physical_damage || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Acessórios recebidos</p>
                  <p className="text-foreground">{o.entry_checklist?.accessories_received || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Observações</p>
                  <p className="text-foreground">{o.entry_checklist?.notes || "-"}</p>
                </div>
              </div>
              <OrderChecklistForm orderId={o.id} initialChecklist={o.entry_checklist} />
            </CardContent>
          </Card>
        </div>
 
        <div className="grid grid-cols-1 gap-6">
          <OrderItemsForm orderId={o.id} />
          <ServiceNote order={o} items={o.items || []} />
        </div>
      </div>
    </div>
  )
}
