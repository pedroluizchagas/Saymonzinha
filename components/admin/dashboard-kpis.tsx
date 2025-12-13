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
  lead: { label: "Lead", color: "bg-gray-500" },
  awaiting_device: { label: "Aguardando", color: "bg-yellow-500" },
  in_analysis: { label: "Análise", color: "bg-blue-500" },
  awaiting_approval: { label: "Aprovação", color: "bg-orange-500" },
  in_repair: { label: "Reparo", color: "bg-purple-500" },
  ready: { label: "Pronto", color: "bg-green-500" },
  delivered: { label: "Entregue", color: "bg-gray-400" },
  cancelled: { label: "Cancelado", color: "bg-red-500" },
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
      {/* KPI Cards Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Faturamento Bruto"
          value={formatCurrency(data.financial.grossRevenue)}
          subtitle="este mês"
          icon={DollarSign}
          trend={data.financial.trend}
          iconColor="text-green-500"
          iconBg="bg-green-500/10"
        />
        <KPICard
          title="Lucro Líquido"
          value={formatCurrency(data.financial.profit)}
          subtitle="após despesas"
          icon={TrendingUp}
          iconColor={data.financial.profit >= 0 ? "text-green-500" : "text-red-500"}
          iconBg={data.financial.profit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}
        />
        <KPICard
          title="Ordens de Serviço"
          value={data.orders.total.toString()}
          subtitle={`${data.orders.pending} em andamento`}
          icon={ClipboardList}
          trend={data.orders.trend}
          iconColor="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <KPICard
          title="Ticket Médio"
          value={formatCurrency(data.financial.ticketMedio)}
          subtitle="por venda"
          icon={ShoppingCart}
          iconColor="text-purple-500"
          iconBg="bg-purple-500/10"
        />
      </div>

      {/* Segunda linha de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Taxa de Aprovação"
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
          subtitle={`+${data.customers.new} novos este mês`}
          icon={Users}
          iconColor="text-cyan-500"
          iconBg="bg-cyan-500/10"
        />
      </div>

      {/* Grid de detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Defeitos */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary" />
              Top Defeitos do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.topProblems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum dado disponível</p>
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

        {/* Resumo Financeiro */}
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
                <span className="text-sm font-medium text-foreground">Lucro Líquido</span>
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

        {/* Ordens Recentes */}
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
      </div>

      {/* Ações Rápidas */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-foreground">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickAction href="/admin/orders/new" icon={ClipboardList} title="Nova OS" description="Criar ordem" />
            <QuickAction href="/admin/pdv" icon={ShoppingCart} title="Abrir PDV" description="Realizar venda" />
            <QuickAction
              href="/admin/leads"
              icon={FileText}
              title="Ver Leads"
              description={`${data.leads.pending} pendentes`}
              highlight={data.leads.pending > 0}
            />
            <QuickAction href="/admin/financial" icon={DollarSign} title="Financeiro" description="Ver fluxo" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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
