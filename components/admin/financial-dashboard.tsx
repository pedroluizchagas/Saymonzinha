"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { TrendingUp, TrendingDown, DollarSign, Plus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
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
      day: "2-digit",
      month: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entradas</p>
                <p className="text-2xl font-bold text-green-500">R$ {totalIncome.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saídas</p>
                <p className="text-2xl font-bold text-red-500">R$ {totalExpense.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                  R$ {balance.toFixed(2)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${balance >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                <DollarSign className={`w-6 h-6 ${balance >= 0 ? "text-green-500" : "text-red-500"}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contas a Pagar */}
        {pendingTransactions.length > 0 && (
          <Card className="bg-card border-border border-yellow-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Contas Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Vence: {transaction.due_date ? formatDate(transaction.due_date) : "Sem data"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-red-500">R$ {transaction.amount.toFixed(2)}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkPaid(transaction.id)}
                        className="bg-transparent"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão Nova Transação */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-foreground">Fluxo de Caixa</CardTitle>
            <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Nova Transação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Tipo *</Label>
                    <Select value={newType} onValueChange={(v) => setNewType(v as TransactionType)}>
                      <SelectTrigger className="bg-background border-input">
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
                      <Label className="text-foreground">Categoria</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger className="bg-background border-input">
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
                    <Label className="text-foreground">Descrição *</Label>
                    <Input
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="bg-background border-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-foreground">Valor (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="bg-background border-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground">Vencimento</Label>
                      <Input
                        type="date"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="bg-background border-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Observações</Label>
                    <Textarea
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="bg-background border-input resize-none"
                      rows={2}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateTransaction}
                    disabled={!newDescription || !newAmount || isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma transação este mês</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Data</TableHead>
                    <TableHead className="text-muted-foreground">Descrição</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id} className="border-border">
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell className="text-foreground">{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.category ? (
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: transaction.category.color,
                              color: transaction.category.color,
                            }}
                          >
                            {transaction.category.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          transaction.type === "income" || transaction.type === "deposit"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "income" || transaction.type === "deposit" ? "+" : "-"} R${" "}
                        {transaction.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
