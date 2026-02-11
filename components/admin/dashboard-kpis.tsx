"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ClipboardList,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Target,
  Wrench,
  ArrowRight,
  ShoppingCart,
  ChevronRight,
} from "lucide-react"
import type { ServiceOrderStatus } from "@/types/database"

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

const STATUS_LABELS: Record<ServiceOrderStatus, { label: string; color: string }> = {
  lead: { label: "LEAD", color: "bg-gray-500" },
  awaiting_device: { label: "AGUARDANDO", color: "bg-yellow-600" },
  in_analysis: { label: "ANALISE", color: "bg-blue-500" },
  awaiting_approval: { label: "APROVACAO", color: "bg-orange-500" },
  in_repair: { label: "REPARO", color: "bg-purple-500" },
  ready: { label: "PRONTO", color: "bg-green-500" },
  delivered: { label: "ENTREGUE", color: "bg-gray-500" },
  cancelled: { label: "CANCELADO", color: "bg-red-500" },
}

export function DashboardKPIs({ data }: DashboardKPIsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* ================================================================ */}
      {/* MOBILE LAYOUT - identico ao design da imagem                     */}
      {/* ================================================================ */}
      <div className="lg:hidden space-y-6">

        {/* --- KPI Cards - Scroll Horizontal (deslizar para o lado) --- */}
        <div className="-mx-4 overflow-x-auto kpi-scroll-hide snap-x snap-mandatory" style={{ WebkitOverflowScrolling: "touch" }}>
          <div className="flex gap-3 px-4">

            {/* Faturamento Bruto */}
            <div className="w-[44vw] min-w-[160px] max-w-[200px] flex-shrink-0 snap-start">
              <Card className="bg-card border-border h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-full bg-green-500/15 flex items-center justify-center mb-3">
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {formatCurrency(data.financial.grossRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Faturamento Bruto</p>
                  <p className={`text-xs mt-1 ${data.financial.trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {data.financial.trend >= 0 ? "+" : ""}{data.financial.trend.toFixed(0)}% este mes
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Lucro Liquido */}
            <div className="w-[44vw] min-w-[160px] max-w-[200px] flex-shrink-0 snap-start">
              <Card className="bg-card border-border h-full">
                <CardContent className="p-4">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${data.financial.profit >= 0 ? "bg-green-500/15" : "bg-red-500/15"}`}>
                    {data.financial.profit >= 0
                      ? <TrendingUp className="w-4 h-4 text-green-500" />
                      : <TrendingDown className="w-4 h-4 text-red-500" />
                    }
                  </div>
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {formatCurrency(data.financial.profit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Lucro Liquido</p>
                  <p className="text-xs text-muted-foreground mt-1">apos despesas</p>
                  {data.financial.profit < 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3 text-red-500" />
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Ordens de Servico */}
            <div className="w-[44vw] min-w-[160px] max-w-[200px] flex-shrink-0 snap-start">
              <Card className="bg-card border-border h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-full bg-blue-500/15 flex items-center justify-center mb-3">
                    <ClipboardList className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {data.orders.total}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Ordens de Servico</p>
                  <p className="text-xs text-muted-foreground mt-1">{data.orders.pending} em andamento</p>
                </CardContent>
              </Card>
            </div>

            {/* Ticket Medio */}
            <div className="w-[44vw] min-w-[160px] max-w-[200px] flex-shrink-0 snap-start">
              <Card className="bg-card border-border h-full">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-full bg-purple-500/15 flex items-center justify-center mb-3">
                    <ShoppingCart className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xl font-bold text-foreground leading-tight">
                    {formatCurrency(data.financial.ticketMedio)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Ticket Medio</p>
                  <p className="text-xs text-muted-foreground mt-1">por venda</p>
                </CardContent>
              </Card>
            </div>

            {/* Spacer final para o ultimo card nao ficar colado na borda */}
            <div className="w-1 flex-shrink-0" />
          </div>
        </div>

        {/* --- ACOES RAPIDAS --- */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Acoes Rapidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/admin/orders/new"
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Nova OS</p>
                <p className="text-xs text-muted-foreground">Criar ordem</p>
              </div>
            </Link>
            <Link
              href="/admin/pdv"
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">Abrir PDV</p>
                <p className="text-xs text-muted-foreground">Realizar venda</p>
              </div>
            </Link>
          </div>
          <div className="mt-3">
            <Link
              href="/admin/leads"
              className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                data.leads.pending > 0
                  ? "border-red-500/40 bg-red-500/10 hover:bg-red-500/15"
                  : "border-border bg-card hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${data.leads.pending > 0 ? "text-red-500" : "text-muted-foreground"}`} />
                <div>
                  <p className="font-medium text-foreground text-sm">Ver Leads</p>
                  <p className={`text-xs ${data.leads.pending > 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {data.leads.pending} pendentes de contato
                  </p>
                </div>
              </div>
              <ArrowRight className={`w-4 h-4 ${data.leads.pending > 0 ? "text-red-500" : "text-muted-foreground"}`} />
            </Link>
          </div>
        </div>

        {/* --- ORDENS RECENTES --- */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Ordens Recentes
            </h3>
            <Link href="/admin/orders" className="text-xs text-primary font-medium">
              Ver todas
            </Link>
          </div>
          <Card className="bg-card border-border overflow-hidden">
            <CardContent className="p-0">
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">Nenhuma ordem recente</p>
              ) : (
                <div className="divide-y divide-border">
                  {data.recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/admin/orders/${order.id}`}
                      className="flex items-start gap-3 p-4 hover:bg-secondary/30 transition-colors"
                    >
                      {/* Bullet indicator */}
                      <div className="mt-2 w-2 h-2 rounded-full bg-foreground/60 flex-shrink-0" />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-foreground">
                            OS #{order.order_number}
                          </span>
                          <Badge
                            className={`${STATUS_LABELS[order.status].color} text-white text-[10px] px-1.5 py-0 leading-4 uppercase font-semibold`}
                            variant="secondary"
                          >
                            {STATUS_LABELS[order.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.device_brand} {order.device_model}
                        </p>
                        <p className="text-xs text-muted-foreground/70 truncate">
                          {order.customer?.name || "Cliente"}
                        </p>
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                        <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* --- RESUMO FINANCEIRO --- */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-base">Resumo Financeiro</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Faturamento Bruto</span>
                <span className="text-sm font-medium text-foreground">{formatCurrency(data.financial.grossRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxas</span>
                <span className="text-sm font-medium text-red-500">
                  - {formatCurrency(data.financial.grossRevenue - data.financial.netRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Despesas</span>
                <span className="text-sm font-medium text-red-500">
                  - {formatCurrency(data.financial.expenses)}
                </span>
              </div>

              <div className="h-px bg-border my-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Lucro Liquido</span>
                <span className={`text-lg font-bold ${data.financial.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {formatCurrency(data.financial.profit)}
                </span>
              </div>
            </div>

            <Link
              href="/admin/financial"
              className="flex items-center justify-end gap-1 text-xs text-primary hover:underline mt-4"
            >
              Ver detalhes
              <ArrowRight className="w-3 h-3" />
            </Link>
          </CardContent>
        </Card>

        {/* --- TOP DEFEITOS --- */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Top Defeitos
          </h3>
          <Card className="bg-card border-border">
            <CardContent className="p-4 space-y-4">
              {data.topProblems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponivel</p>
              ) : (
                data.topProblems.map((problem) => {
                  const total = data.topProblems.reduce((sum, p) => sum + p.count, 0)
                  const percentage = total > 0 ? (problem.count / total) * 100 : 0
                  return (
                    <div key={problem.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground">{problem.name}</span>
                        <span className="text-muted-foreground">
                          {problem.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Espaco para bottom navigation */}
        <div className="h-4" />
      </div>

      {/* ================================================================ */}
      {/* DESKTOP LAYOUT - layout original mantido                         */}
      {/* ================================================================ */}
      <div className="hidden lg:block space-y-6">

        {/* KPI Cards - Desktop (4 colunas) */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            title="Faturamento Bruto"
            value={formatCurrency(data.financial.grossRevenue)}
            subtitle="este mes"
            icon={DollarSign}
            trend={data.financial.trend}
            iconColor="text-green-500"
            iconBg="bg-green-500/10"
          />
          <KPICard
            title="Lucro Liquido"
            value={formatCurrency(data.financial.profit)}
            subtitle="apos despesas"
            icon={TrendingUp}
            iconColor={data.financial.profit >= 0 ? "text-green-500" : "text-red-500"}
            iconBg={data.financial.profit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
          />
          <KPICard
            title="Ordens de Servico"
            value={data.orders.total.toString()}
            subtitle={`${data.orders.pending} em andamento`}
            icon={ClipboardList}
            trend={data.orders.trend}
            iconColor="text-blue-500"
            iconBg="bg-blue-500/10"
          />
          <KPICard
            title="Ticket Medio"
            value={formatCurrency(data.financial.ticketMedio)}
            subtitle="por venda"
            icon={ShoppingCart}
            iconColor="text-purple-500"
            iconBg="bg-purple-500/10"
          />
        </div>

        {/* Segunda linha de KPIs - Desktop */}
        <div className="grid grid-cols-3 gap-4">
          <KPICard
            title="Taxa de Aprovacao"
            value={`${data.leads.conversionRate.toFixed(1)}%`}
            subtitle={`${data.leads.converted} de ${data.leads.total} leads`}
            icon={Target}
            iconColor="text-orange-500"
            iconBg="bg-orange-500/10"
          />
          <KPICard
            title="Novos Leads"
            value={data.leads.total.toString()}
            subtitle={`${data.leads.pending} aguardando contato`}
            icon={FileText}
            iconColor="text-yellow-500"
            iconBg="bg-yellow-500/10"
            highlight={data.leads.pending > 0}
          />
          <KPICard
            title="Clientes Ativos"
            value={data.customers.total.toString()}
            subtitle={`+${data.customers.new} novos este mes`}
            icon={Users}
            iconColor="text-cyan-500"
            iconBg="bg-cyan-500/10"
          />
        </div>

        {/* Acoes Rapidas - Desktop */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground">Acoes Rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction href="/admin/orders/new" icon={ClipboardList} title="Nova OS" description="Criar ordem" />
              <QuickAction href="/admin/pdv" icon={ShoppingCart} title="Abrir PDV" description="Realizar venda" />
            </div>
            <div className="mt-4">
              <QuickActionBanner
                href="/admin/leads"
                icon={FileText}
                title="Ver Leads"
                description={`${data.leads.pending} pendentes de contato`}
                highlight={data.leads.pending > 0}
              />
            </div>
          </CardContent>
        </Card>

        {/* Grid 3 colunas: Ordens, Financeiro, Defeitos - Desktop */}
        <div className="grid grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-blue-500" />
                Ordens Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma ordem recente</p>
              ) : (
                <div className="space-y-3">
                  {data.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">OS #{order.order_number}</p>
                          <Badge
                            className={`${STATUS_LABELS[order.status].color} text-white text-xs px-1.5 py-0.5`}
                            variant="secondary"
                          >
                            {STATUS_LABELS[order.status].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {order.customer?.name || "Cliente"} - {order.device_brand} {order.device_model}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">{formatDate(order.created_at)}</span>
                    </div>
                  ))}
                </div>
              )}

              <Link
                href="/admin/orders"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline mt-4"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Resumo Financeiro - Desktop */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Faturamento Bruto</span>
                  <span className="font-medium text-foreground">{formatCurrency(data.financial.grossRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taxas de Pagamento</span>
                  <span className="font-medium text-red-500">
                    - {formatCurrency(data.financial.grossRevenue - data.financial.netRevenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Despesas</span>
                  <span className="font-medium text-red-500">- {formatCurrency(data.financial.expenses)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Lucro Liquido</span>
                  <span className={`font-bold ${data.financial.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(data.financial.profit)}
                  </span>
                </div>
              </div>

              <Link
                href="/admin/financial"
                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline mt-4"
              >
                Ver detalhes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>

          {/* Top Defeitos - Desktop */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                Top Defeitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.topProblems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponivel</p>
              ) : (
                data.topProblems.map((problem, index) => {
                  const total = data.topProblems.reduce((sum, p) => sum + p.count, 0)
                  const percentage = total > 0 ? (problem.count / total) * 100 : 0
                  return (
                    <div key={problem.name} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-foreground flex items-center gap-2">
                          <span className="text-muted-foreground">{index + 1}.</span>
                          {problem.name}
                        </span>
                        <span className="text-muted-foreground">
                          {problem.count} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/* ================================================================ */
/* Sub-componentes (usados no layout Desktop)                        */
/* ================================================================ */

interface KPICardProps {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  trend?: number
  iconColor: string
  iconBg: string
  highlight?: boolean
}

function KPICard({ title, value, subtitle, icon: Icon, trend, iconColor, iconBg, highlight }: KPICardProps) {
  return (
    <Card className={`bg-card border-border ${highlight ? "border-primary/50 ring-1 ring-primary/20" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          {trend !== undefined && trend !== 0 && (
            <div
              className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  highlight?: boolean
}

function QuickAction({ href, icon: Icon, title, description, highlight }: QuickActionProps) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all group ${
        highlight
          ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
          : "border-border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30"
      }`}
    >
      <Icon
        className={`w-6 h-6 mb-2 transition-colors ${highlight ? "text-primary" : "text-muted-foreground group-hover:text-primary"}`}
      />
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  )
}

interface QuickActionBannerProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  highlight?: boolean
}

function QuickActionBanner({ href, icon: Icon, title, description, highlight }: QuickActionBannerProps) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
        highlight ? "border-red-500/40 bg-red-500/10 hover:bg-red-500/15" : "border-border bg-secondary/30 hover:bg-secondary/50"
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${highlight ? "text-red-500" : "text-muted-foreground"}`} />
        <div>
          <p className="font-medium text-foreground text-sm">{title}</p>
          <p className={`text-xs ${highlight ? "text-red-500" : "text-muted-foreground"}`}>{description}</p>
        </div>
      </div>
      <ArrowRight className={`w-4 h-4 ${highlight ? "text-red-500" : "text-muted-foreground"}`} />
    </Link>
  )
}
