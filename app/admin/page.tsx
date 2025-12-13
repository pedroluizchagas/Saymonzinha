import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { DashboardKPIs } from "@/components/admin/dashboard-kpis"
import type { Profile } from "@/types/database"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Datas para filtros
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  // ===== ORDENS DE SERVIÇO =====
  const { count: totalOrders } = await supabase
    .from("service_orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  const { count: lastMonthOrders } = await supabase
    .from("service_orders")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  const { count: pendingOrders } = await supabase
    .from("service_orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["awaiting_device", "in_analysis", "awaiting_approval", "in_repair"])

  const { count: completedOrders } = await supabase
    .from("service_orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["ready", "delivered"])
    .gte("created_at", startOfMonth.toISOString())

  // ===== LEADS =====
  const { count: totalLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  const { count: pendingLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: convertedLeads } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("status", "converted")
    .gte("created_at", startOfMonth.toISOString())

  // ===== CLIENTES =====
  const { count: totalCustomers } = await supabase.from("customers").select("*", { count: "exact", head: true })

  const { count: newCustomers } = await supabase
    .from("customers")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startOfMonth.toISOString())

  // ===== FINANCEIRO =====
  const { data: salesData } = await supabase
    .from("sales")
    .select("total, net_total")
    .gte("created_at", startOfMonth.toISOString())

  const grossRevenue = salesData?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0
  const netRevenue = salesData?.reduce((sum, sale) => sum + (sale.net_total || 0), 0) || 0

  const { data: lastMonthSales } = await supabase
    .from("sales")
    .select("total")
    .gte("created_at", startOfLastMonth.toISOString())
    .lte("created_at", endOfLastMonth.toISOString())

  const lastMonthRevenue = lastMonthSales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0

  const { data: expensesData } = await supabase
    .from("cash_transactions")
    .select("amount")
    .in("type", ["expense", "withdrawal"])
    .eq("is_paid", true)
    .gte("created_at", startOfMonth.toISOString())

  const totalExpenses = expensesData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  // Ticket Médio
  const ticketMedio = salesData && salesData.length > 0 ? grossRevenue / salesData.length : 0

  // ===== TOP DEFEITOS =====
  const { data: problemStats } = await supabase
    .from("service_orders")
    .select("problem_description")
    .gte("created_at", startOfMonth.toISOString())

  // Contar tipos de problemas mais comuns
  const problemCounts: Record<string, number> = {}
  problemStats?.forEach((order) => {
    const problem = order.problem_description?.toLowerCase() || "outros"
    const key = problem.includes("tela")
      ? "Troca de Tela"
      : problem.includes("bateria")
        ? "Bateria"
        : problem.includes("conector") || problem.includes("carga")
          ? "Conector de Carga"
          : problem.includes("formatação") || problem.includes("conta")
            ? "Software"
            : "Outros"
    problemCounts[key] = (problemCounts[key] || 0) + 1
  })

  const topProblems = Object.entries(problemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  // ===== ORDENS RECENTES =====
  const { data: recentOrders } = await supabase
    .from("service_orders")
    .select("id, order_number, status, device_brand, device_model, created_at, customer:customers(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  // Calcular tendências
  const ordersTrend = lastMonthOrders ? (((totalOrders || 0) - lastMonthOrders) / lastMonthOrders) * 100 : 0
  const revenueTrend = lastMonthRevenue ? ((grossRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0
  const conversionRate = totalLeads ? ((convertedLeads || 0) / totalLeads) * 100 : 0

  const kpiData = {
    orders: {
      total: totalOrders || 0,
      pending: pendingOrders || 0,
      completed: completedOrders || 0,
      trend: ordersTrend,
    },
    leads: {
      total: totalLeads || 0,
      pending: pendingLeads || 0,
      converted: convertedLeads || 0,
      conversionRate,
    },
    customers: {
      total: totalCustomers || 0,
      new: newCustomers || 0,
    },
    financial: {
      grossRevenue,
      netRevenue,
      expenses: totalExpenses,
      profit: netRevenue - totalExpenses,
      trend: revenueTrend,
      ticketMedio,
    },
    topProblems,
    recentOrders: recentOrders || [],
  }

  return (
    <div>
      <AdminHeader user={profile as Profile | null} title="Dashboard" subtitle="Visão geral do seu negócio" />

      <div className="p-6">
        <DashboardKPIs data={kpiData} />
      </div>
    </div>
  )
}
