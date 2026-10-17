"use client"

// Início do painel, num layout só para celular e computador, no vocabulário da home: o aviso dos
// pedidos de orçamento esperando contato; a faixa vermelha com o dinheiro do mês, como a faixa de
// números da Raio-X; os números do mês em display; e as ordens recentes, o resumo financeiro e os
// defeitos do mês.

import Link from "next/link"
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ServiceOrderStatus } from "@/types/database"
import { Money } from "./money"
import { OsStatus } from "./os-status"

interface DashboardKPIsProps {
  data: {
    orders: {
      total: number
      pending: number
      completed: number
      trend: number
    }
    leads: {
      total: number
      pending: number
      converted: number
      conversionRate: number
    }
    customers: {
      total: number
      new: number
    }
    financial: {
      grossRevenue: number
      netRevenue: number
      expenses: number
      profit: number
      trend: number
      ticketMedio: number
    }
    topProblems: { name: string; count: number }[]
    recentOrders: {
      id: string
      order_number: number
      status: ServiceOrderStatus
      device_brand: string
      device_model: string
      created_at: string
      customer: { name: string } | null
    }[]
  }
}

const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" })

export function DashboardKPIs({ data }: DashboardKPIsProps) {
  const { financial, orders, leads, customers } = data
  const totalProblems = data.topProblems.reduce((sum, p) => sum + p.count, 0)
  const trend = Math.round(financial.trend)

  return (
    <div className="space-y-4 lg:space-y-6">
      {leads.pending > 0 && (
        <Link
          href="/admin/leads"
          className="group flex items-center gap-3 rounded-[18px] border border-sc-red/35 bg-sc-ember px-3 py-3 transition-colors hover:bg-[#3a0805] sm:px-4"
        >
          <span className="grid size-[38px] shrink-0 place-items-center rounded-[10px] bg-sc-red text-white">
            <FileText className="size-[18px]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-sc-bone">
              {leads.pending === 1 ? "1 pedido de orçamento esperando contato" : `${leads.pending} pedidos de orçamento esperando contato`}
            </span>
            <span className="sc-label block text-sc-stone">Chegaram pelo site</span>
          </span>
          {/* as peças sc-* vêm fora das camadas do Tailwind: o max-sm:hidden fica num invólucro */}
          <span className="shrink-0 max-sm:hidden">
            <span className="sc-pill sc-pill--red sc-pill--sm">
              Ver pedidos <ArrowUpRight aria-hidden="true" />
            </span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-sc-stone sm:hidden" aria-hidden="true" />
        </Link>
      )}

      {/* o dinheiro do mês: a faixa vermelha da Raio-X */}
      <section aria-label="Dinheiro do mês" className="grid overflow-hidden rounded-[20px] bg-sc-red text-sc-ink md:grid-cols-3">
        <BandItem label="Faturamento bruto" note={trend ? `${trend > 0 ? "+" : "−"}${Math.abs(trend)}% sobre o mês passado` : "No mês"}>
          <Money value={financial.grossRevenue} />
        </BandItem>
        <BandItem label="Lucro líquido" note="Depois de taxas e despesas">
          <Money value={financial.profit} />
        </BandItem>
        <BandItem label="Ticket médio" note="Por venda">
          <Money value={financial.ticketMedio} />
        </BandItem>
      </section>

      {/* os números do mês, como as estatísticas da home */}
      <section aria-label="Números do mês" className="grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-sc-line bg-sc-line lg:grid-cols-4">
        <Stat value={orders.total} label="Ordens de serviço" note={`${orders.pending} em andamento`} />
        <Stat value={leads.total} label="Pedidos de orçamento" note={`${leads.pending} aguardando contato`} alert={leads.pending > 0} />
        <Stat value={`${Math.round(leads.conversionRate)}%`} label="Aprovação" note={`${leads.converted} de ${leads.total} pedidos`} />
        <Stat value={customers.total} label="Clientes" note={`+${customers.new} no mês`} />
      </section>

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <Card>
          <CardHeader className="grid-cols-[1fr_auto] items-end">
            <CardTitle>Ordens recentes</CardTitle>
            <Link href="/admin/orders" className="text-[13px] text-sc-stone transition-colors hover:text-sc-bone">
              Ver todas
            </Link>
          </CardHeader>
          <CardContent className="px-2">
            {data.recentOrders.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-sc-stone">Nenhuma ordem de serviço ainda.</p>
            ) : (
              <ul>
                {data.recentOrders.map((order) => (
                  <li key={order.id}>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5 rounded-[14px] px-3 py-3 transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="font-display text-[24px] leading-[0.9] font-black uppercase tracking-[-0.01em] text-sc-bone">
                        OS #{order.order_number}
                      </span>
                      <span className="sc-label justify-self-end text-sc-smoke">{formatDate(order.created_at)}</span>
                      <span className="truncate text-[13px] text-sc-stone">
                        {order.device_brand} {order.device_model} · {order.customer?.name || "Cliente"}
                      </span>
                      <OsStatus status={order.status} className="justify-self-end" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="grid-cols-[1fr_auto] items-end">
            <CardTitle>Resumo financeiro</CardTitle>
            <Link href="/admin/financial" className="text-[13px] text-sc-stone transition-colors hover:text-sc-bone">
              Ver o financeiro
            </Link>
          </CardHeader>
          <CardContent>
            <dl className="grid">
              <Row label="Faturamento bruto" value={financial.grossRevenue} />
              <Row label="Taxas de pagamento" value={-(financial.grossRevenue - financial.netRevenue)} />
              <Row label="Despesas" value={-financial.expenses} />
            </dl>
            <div className="mt-4 flex items-end justify-between gap-3 border-t border-sc-line pt-4">
              <span className="sc-label text-sc-stone">Lucro líquido</span>
              <Money value={financial.profit} className={financial.profit < 0 ? "text-[38px] text-sc-red" : "text-[38px] text-sc-bone"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Defeitos do mês</CardTitle>
          </CardHeader>
          <CardContent>
            {data.topProblems.length === 0 ? (
              <p className="py-6 text-center text-sm text-sc-stone">Ainda sem ordens de serviço no mês.</p>
            ) : (
              <ol className="grid gap-4">
                {data.topProblems.map((problem, i) => {
                  const share = totalProblems > 0 ? (problem.count / totalProblems) * 100 : 0
                  return (
                    <li key={problem.name} className="grid gap-2">
                      <div className="flex items-baseline gap-3">
                        <span className="sc-label text-sc-smoke">{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex-1 truncate text-sm text-sc-bone">{problem.name}</span>
                        <span className="sc-label text-sc-stone">
                          {problem.count} · {share.toFixed(0)}%
                        </span>
                      </div>
                      <span className="h-1 overflow-hidden rounded-full bg-sc-line" aria-hidden="true">
                        <span className="block h-full rounded-full bg-sc-red" style={{ width: `${share}%` }} />
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BandItem({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[150px] flex-col justify-end gap-3 border-black/20 p-5 not-first:border-t md:min-h-[210px] md:p-6 md:not-first:border-t-0 md:not-first:border-l">
      <p className="sc-label">{label}</p>
      <p className="text-[clamp(48px,5.2vw,84px)]">{children}</p>
      <p className="sc-label opacity-70">{note}</p>
    </div>
  )
}

function Stat({ value, label, note, alert = false }: { value: number | string; label: string; note: string; alert?: boolean }) {
  return (
    <div className="flex min-h-[148px] flex-col justify-end gap-2.5 bg-sc-carbon p-4 sm:p-5 lg:min-h-[170px] lg:p-6">
      <span className="font-display text-[clamp(48px,5vw,76px)] leading-[0.84] font-black tracking-[-0.01em] tabular-nums text-sc-bone">
        {value}
      </span>
      <span className="sc-label text-sc-stone">{label}</span>
      <span className={alert ? "flex items-center gap-1.5 text-[13px] text-sc-red" : "text-[13px] text-sc-stone"}>
        {alert && <span className="size-1.5 rounded-full bg-sc-red" aria-hidden="true" />}
        {note}
      </span>
    </div>
  )
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-sc-line/60 py-2.5 last:border-0">
      <dt className="text-sm text-sc-stone">{label}</dt>
      <dd className={value < 0 ? "text-sm font-medium tabular-nums text-sc-red" : "text-sm font-medium tabular-nums text-sc-bone"}>
        {value < 0 ? "− " : ""}
        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Math.abs(value))}
      </dd>
    </div>
  )
}
