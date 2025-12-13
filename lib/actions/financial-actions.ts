"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateTransactionDTO {
  type: "income" | "expense" | "withdrawal" | "deposit"
  category_id?: string
  description: string
  amount: number
  notes?: string
  due_date?: string
  is_paid?: boolean
}

interface ActionResult {
  success: boolean
  message: string
}

export async function createTransaction(data: CreateTransactionDTO): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Usuário não autenticado" }
    }

    const { error } = await supabase.from("cash_transactions").insert({
      type: data.type,
      category_id: data.category_id || null,
      description: data.description,
      amount: data.amount,
      user_id: user.id,
      notes: data.notes || null,
      due_date: data.due_date || null,
      is_paid: data.is_paid ?? true,
      paid_at: data.is_paid ? new Date().toISOString() : null,
    })

    if (error) {
      console.error("Error creating transaction:", error)
      return { success: false, message: "Erro ao criar transação" }
    }

    revalidatePath("/admin/financial")

    return { success: true, message: "Transação criada com sucesso!" }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}

export async function markTransactionPaid(transactionId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("cash_transactions")
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
      })
      .eq("id", transactionId)

    if (error) {
      console.error("Error marking transaction paid:", error)
      return { success: false, message: "Erro ao marcar como pago" }
    }

    revalidatePath("/admin/financial")

    return { success: true, message: "Transação marcada como paga!" }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}
