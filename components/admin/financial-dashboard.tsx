"use client"

// Financeiro do painel: os totais do mês em display (entrada em osso, saída em vermelho, o saldo pelo
// sinal), as contas pendentes com o vencimento e o fluxo de caixa com o sinal de cada movimento.

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Wallet, Plus, CheckCircle2, Loader2 } from "lucide-react"
import { formatPrice } from "@/lib/catalog"
import { Money } from "./money"
import { createTransaction, markTransactionPaid } from "@/lib/actions/financial-actions"
import type { CashTransaction, ExpenseCategory, TransactionType } from "@/types/database"

interface FinancialDashboardProps {
  transactions: CashTransaction[]
  pendingTransactions: CashTransaction[]
  categories: ExpenseCategory[]
}

export function FinancialDashboard({
  transactions: initialTransactions,
  pendingTransactions: initialPending,
  categories,
}: FinancialDashboardProps) {
  const [transactions, setTransactions] = useState(initialTransactions)
  const [pendingTransactions, setPendingTransactions] = useState(initialPending)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [newType, setNewType] = useState<TransactionType>("expense")
  const [newCategory, setNewCategory] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newAmount, setNewAmount] = useState("")
  const [newNotes, setNewNotes] = useState("")
  const [newDueDate, setNewDueDate] = useState("")
  const [newIsPaid, setNewIsPaid] = useState(true)

  // Cálculos
  const totalIncome = transactions
    .filter((t) => t.type === "income" || t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions
    .filter((t) => t.type === "expense" || t.type === "withdrawal")
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpense

  const handleCreateTransaction = async () => {
    setIsSubmitting(true)

    const result = await createTransaction({
      type: newType,
      category_id: newCategory || undefined,
      description: newDescription,
      amount: Number.parseFloat(newAmount),
      notes: newNotes || undefined,
      due_date: newDueDate || undefined,
      is_paid: newIsPaid,
    })

    setIsSubmitting(false)

    if (result.success) {
      setShowNewDialog(false)
      // Reset form
      setNewType("expense")
      setNewCategory("")
      setNewDescription("")
      setNewAmount("")
      setNewNotes("")
      setNewDueDate("")
      setNewIsPaid(true)
      // Refresh page to get updated data
      window.location.reload()
    }
  }

  const handleMarkPaid = async (id: string) => {
    const result = await markTransactionPaid(id)
    if (result.success) {
      setPendingTransactions(pendingTransactions.filter((t) => t.id !== id))
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* os totais do mês, como as estatísticas da home */}
      <section aria-label="Totais do mês" className="grid gap-px overflow-hidden rounded-[20px] border border-sc-line bg-sc-line sm:grid-cols-3">
        <Total label="Entradas" note="Vendas e depósitos">
          <Money value={totalIncome} signed className="text-sc-bone" />
        </Total>
        <Total label="Saídas" note="Despesas e sangrias">
          <Money value={-totalExpense} className="text-sc-red" />
        </Total>
        <Total label="Saldo" note={balance < 0 ? "Saiu mais do que entrou" : "Entrou mais do que saiu"} accent={balance < 0}>
          <Money value={balance} className={balance < 0 ? "text-sc-red" : "text-sc-bone"} />
        </Total>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a pagar */}
        {pendingTransactions.length > 0 && (
          <Card>
            <CardHeader>
              <p className="sc-label text-sc-stone">A pagar</p>
              <CardTitle>Contas pendentes</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-3">
              <ul className="divide-y divide-sc-line">
                {pendingTransactions.map((transaction) => {
                  const overdue = !!transaction.due_date && new Date(transaction.due_date) < new Date(new Date().toDateString())
                  return (
                    <li key={transaction.id} className="flex items-center gap-3 px-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-sc-bone">{transaction.description}</p>
                        <p className={overdue ? "sc-label mt-1 text-sc-red" : "sc-label mt-1 text-sc-stone"}>
                          {transaction.due_date
                            ? `${overdue ? "Venceu" : "Vence"} ${formatDate(transaction.due_date)}`
                            : "Sem vencimento"}
                        </p>
                      </div>
                      <p className="font-semibold tabular-nums text-sc-red">− {formatPrice(transaction.amount)}</p>
                      <Button
                        size="icon-sm"
                        variant="outline"
                        onClick={() => handleMarkPaid(transaction.id)}
                        aria-label={`Marcar ${transaction.description} como paga`}
                        title="Marcar como paga"
                      >
                        <CheckCircle2 className="size-4" />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Botão Nova Transação */}
        <Card>
          <CardHeader className="grid-cols-[1fr_auto] items-end">
            <div className="grid gap-2">
              <p className="sc-label text-sc-stone">No mês</p>
              <CardTitle>Fluxo de caixa</CardTitle>
            </div>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus />
                  Nova transação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova transação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo *</Label>
                    <Select value={newType} onValueChange={(v) => setNewType(v as TransactionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Entrada</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                        <SelectItem value="withdrawal">Sangria</SelectItem>
                        <SelectItem value="deposit">Depósito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(newType === "expense" || newType === "income") && (
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Descrição *</Label>
                    <Input
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                     
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                       
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Vencimento</Label>
                      <Input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                       
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="border-input resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTransaction}
                    disabled={!newDescription || !newAmount || isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="px-2 sm:px-3">
            {transactions.length === 0 ? (
              <div className="py-8 text-center">
                <Wallet className="mx-auto mb-4 size-10 text-sc-smoke" aria-hidden="true" />
                <p className="text-sc-stone">Nenhuma transação neste mês</p>
              </div>
            ) : (
              <ul className="divide-y divide-sc-line">
                {transactions.slice(0, 10).map((transaction) => {
                  const incoming = transaction.type === "income" || transaction.type === "deposit"
                  return (
                    <li key={transaction.id} className="grid grid-cols-[52px_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3">
                      <span className="sc-label text-sc-smoke">{formatDate(transaction.created_at)}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-sc-bone">{transaction.description}</span>
                        {transaction.category && (
                          <span className="sc-label mt-1 flex items-center gap-1.5 text-sc-stone">
                            <span className="size-1.5 rounded-full" style={{ background: transaction.category.color }} aria-hidden="true" />
                            {transaction.category.name}
                          </span>
                        )}
                      </span>
                      <span className={incoming ? "text-sm font-semibold tabular-nums text-sc-bone" : "text-sm font-semibold tabular-nums text-sc-red"}>
                        {incoming ? "+" : "−"} {formatPrice(transaction.amount)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Total({ label, note, accent = false, children }: { label: string; note: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <div className={accent ? "flex min-h-[150px] flex-col justify-end gap-2.5 bg-sc-ember p-5 lg:min-h-[180px] lg:p-6" : "flex min-h-[150px] flex-col justify-end gap-2.5 bg-sc-carbon p-5 lg:min-h-[180px] lg:p-6"}>
      <span className="sc-label text-sc-stone">{label}</span>
      <span className="text-[clamp(40px,4.4vw,64px)]">{children}</span>
      <span className="text-[13px] text-sc-stone">{note}</span>
    </div>
  )
}
