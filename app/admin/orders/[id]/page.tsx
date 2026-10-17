import { redirect, notFound } from "next/navigation"
import { ArrowLeft, MessageCircle, Phone, Truck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { EntryChecklist, Profile, ServiceOrder } from "@/types/database"
import { Money } from "@/components/admin/money"
import { OS_STATUS, OS_STEPS } from "@/components/admin/os-status"
import { OrderChecklistForm } from "@/components/admin/order-checklist-form"
import { ServiceNote } from "@/components/admin/service-note"
import { OrderItemsForm } from "@/components/admin/order-items-form"
import { cn } from "@/lib/utils"

/** O checklist de entrada como o técnico lê: cada item, o resultado e se ele aponta um problema. */
function checklistRows(c: EntryChecklist | null | undefined) {
  const tri = (v: boolean | null | undefined, ok: string, bad: string) =>
    v === true ? { text: ok, bad: false } : v === false ? { text: bad, bad: true } : { text: "Não verificado", bad: false }
  const screen = { ok: "Sem dano", cracked: "Trincada", broken: "Quebrada" } as const
  return [
    { label: "Tela", ...(c?.screen_condition ? { text: screen[c.screen_condition], bad: c.screen_condition !== "ok" } : { text: "Não verificada", bad: false }) },
    { label: "Liga", ...tri(c?.turns_on, "Sim", "Não") },
    { label: "Touch", ...tri(c?.touch_works, "Funciona", "Não funciona") },
    { label: "Câmeras", ...tri(c?.cameras_work, "Funcionam", "Não funcionam") },
    { label: "Botões", ...tri(c?.buttons_work, "Funcionam", "Não funcionam") },
    { label: "Carregamento", ...tri(c?.charging_port_ok, "OK", "Com problema") },
    { label: "Som", ...tri(c?.speakers_ok, "OK", "Com problema") },
    { label: "Microfone", ...tri(c?.microphone_ok, "OK", "Com problema") },
  ]
}

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : null

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
  const step = OS_STEPS.indexOf(o.status)
  const phone = o.customer?.phone?.replace(/\D/g, "")

  return (
    <div>
      <AdminHeader
        user={profile as Profile | null}
        title={`OS #${o.order_number}`}
        subtitle={`Ordem de serviço · aberta em ${formatDate(o.created_at)}`}
      >
        <Button asChild variant="secondary">
          <Link href="/admin/orders">
            <ArrowLeft aria-hidden="true" />
            Quadro de OS
          </Link>
        </Button>
      </AdminHeader>

      <div className="space-y-4 px-4 pb-8 md:px-8 lg:space-y-6">
        {/* as etapas do conserto, como a linha do tempo da Raio-X */}
        <section aria-label="Etapa da OS" className="rounded-[20px] border border-sc-line bg-sc-carbon p-4 md:p-5">
          {o.status === "cancelled" ? (
            <p className="sc-label text-sc-red">OS cancelada</p>
          ) : (
            <ol className="relative grid grid-cols-6 gap-2">
              <span className="absolute inset-x-0 top-[6px] h-px bg-sc-line" aria-hidden="true" />
              {OS_STEPS.map((status, i) => (
                <li key={status} className="relative grid justify-items-start gap-2.5" aria-current={i === step ? "step" : undefined}>
                  <span
                    className={cn(
                      "size-[13px] rounded-full shadow-[0_0_0_5px_var(--color-sc-carbon)]",
                      i < step ? "bg-sc-stone" : i === step ? "bg-sc-red" : "bg-sc-line",
                    )}
                    aria-hidden="true"
                  />
                  <span className={cn("sc-label", i === step ? "text-sc-red" : i < step ? "text-sc-stone" : "text-sc-smoke")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-[13px] leading-[1.25] max-md:sr-only",
                      i === step ? "font-semibold text-sc-bone" : i < step ? "text-sc-stone" : "text-sc-smoke",
                    )}
                  >
                    {OS_STATUS[status].label}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {o.status !== "cancelled" && (
            <p className="mt-3 text-[15px] font-semibold text-sc-bone md:hidden">{OS_STATUS[o.status].label}</p>
          )}
        </section>

        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <p className="sc-label text-sc-stone">Aparelho</p>
              <CardTitle className="text-[clamp(34px,4vw,52px)]">
                {o.device_brand} {o.device_model}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Fact label="Cor" value={o.device_color} />
                <Fact label="IMEI" value={o.device_imei} />
                <Fact label="Senha" value={o.device_password} />
                <Fact label="Tipo" value={o.problem_type?.name} />
                <Fact label="Recebido em" value={formatDate(o.received_at)} />
                <Fact label="Técnico" value={o.technician?.full_name} />
              </dl>
              <div className="grid gap-2 border-t border-sc-line pt-4">
                <p className="sc-label text-sc-stone">Defeito relatado</p>
                <p className="text-[15px] leading-[1.5] text-sc-bone">{o.problem_description}</p>
              </div>
              {o.diagnosis && (
                <div className="grid gap-2 border-t border-sc-line pt-4">
                  <p className="sc-label text-sc-stone">Diagnóstico</p>
                  <p className="text-[15px] leading-[1.5] text-sc-bone">{o.diagnosis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid content-start gap-4 lg:gap-6">
            <Card>
              <CardHeader>
                <p className="sc-label text-sc-stone">Cliente</p>
                <CardTitle>{o.customer?.name || "Cliente"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {o.customer?.phone && <p className="tabular-nums text-sc-bone">{o.customer.phone}</p>}
                {o.customer?.email && <p className="text-sc-stone">{o.customer.email}</p>}
                {o.customer?.address && <p className="text-sc-stone">{o.customer.address}</p>}
                <p className="flex items-center gap-2 text-sc-stone">
                  <Truck className="size-4 text-sc-smoke" aria-hidden="true" />
                  {o.delivery_type === "store" ? "Retira na loja" : `Busca e entrega${o.delivery_address ? ` · ${o.delivery_address}` : ""}`}
                </p>
                {phone && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button asChild size="sm" className="bg-sc-green text-sc-ink">
                      <a href={`https://wa.me/55${phone}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle aria-hidden="true" />
                        WhatsApp
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="secondary">
                      <a href={`tel:+55${phone}`}>
                        <Phone aria-hidden="true" />
                        Ligar
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Valores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <span className="sc-label text-sc-stone">{o.final_price != null ? "Valor final" : "Estimado"}</span>
                  {o.final_price != null || o.estimated_price != null ? (
                    <Money value={(o.final_price ?? o.estimated_price) as number} className="text-[42px] text-sc-bone" />
                  ) : (
                    <span className="text-sm text-sc-stone">A definir</span>
                  )}
                </div>
                <dl className="grid gap-2 border-t border-sc-line pt-3 text-sm">
                  {o.final_price != null && o.estimated_price != null && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-sc-stone">Estimado</dt>
                      <dd className="tabular-nums text-sc-bone">R$ {o.estimated_price.toFixed(2).replace(".", ",")}</dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-sc-stone">Custo de peças</dt>
                    <dd className="tabular-nums text-sc-bone">R$ {(o.parts_cost ?? 0).toFixed(2).replace(".", ",")}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="grid-cols-[1fr_auto] items-end">
            <div className="grid gap-2">
              <p className="sc-label text-sc-stone">Na entrada</p>
              <CardTitle>Checklist do aparelho</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-sc-line bg-sc-line sm:grid-cols-4">
              {checklistRows(o.entry_checklist).map((row) => (
                <div key={row.label} className="grid gap-1.5 bg-sc-carbon p-3.5">
                  <dt className="sc-label text-sc-stone">{row.label}</dt>
                  <dd className={cn("text-sm", row.bad ? "font-semibold text-sc-red" : "text-sc-bone")}>{row.text}</dd>
                </div>
              ))}
            </dl>
            <dl className="grid gap-4 sm:grid-cols-3">
              <Fact label="Danos físicos" value={o.entry_checklist?.physical_damage} />
              <Fact label="Acessórios recebidos" value={o.entry_checklist?.accessories_received} />
              <Fact label="Observações" value={o.entry_checklist?.notes} />
            </dl>
            <details className="group rounded-[14px] border border-sc-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-sc-bone [&::-webkit-details-marker]:hidden">
                Editar o checklist
                <span className="sc-label text-sc-stone group-open:hidden">Abrir</span>
                <span className="sc-label hidden text-sc-stone group-open:inline">Fechar</span>
              </summary>
              <div className="border-t border-sc-line p-4">
                <OrderChecklistForm orderId={o.id} initialChecklist={o.entry_checklist} />
              </div>
            </details>
          </CardContent>
        </Card>

        <OrderItemsForm orderId={o.id} />
        <ServiceNote order={o} items={o.items || []} />
      </div>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="grid content-start gap-1.5">
      <dt className="sc-label text-sc-stone">{label}</dt>
      <dd className={cn("text-sm", value ? "text-sc-bone" : "text-sc-smoke")}>{value || "—"}</dd>
    </div>
  )
}
