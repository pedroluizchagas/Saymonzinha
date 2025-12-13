import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { FinancialDashboard } from "@/components/admin/financial-dashboard"
import type { Profile, CashTransaction, ExpenseCategory } from "@/types/database"

export default async function FinancialPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Buscar transações do mês atual
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: transactions } = await supabase
    .from("cash_transactions")
    .select("*, category:expense_categories(*)")
    .gte("created_at", startOfMonth.toISOString())
    .order("created_at", { ascending: false })

  const { data: categories } = await supabase.from("expense_categories").select("*").eq("is_active", true)

  // Buscar contas a pagar/receber (não pagas)
  const { data: pendingTransactions } = await supabase
    .from("cash_transactions")
    .select("*, category:expense_categories(*)")
    .eq("is_paid", false)
    .order("due_date", { ascending: true })

  return (
    <div>
      <AdminHeader user={profile as Profile | null} title="Financeiro" subtitle="Controle seu fluxo de caixa" />

      <div className="p-6">
        <FinancialDashboard
          transactions={(transactions as CashTransaction[]) || []}
          pendingTransactions={(pendingTransactions as CashTransaction[]) || []}
          categories={(categories as ExpenseCategory[]) || []}
        />
      </div>
    </div>
  )
}
