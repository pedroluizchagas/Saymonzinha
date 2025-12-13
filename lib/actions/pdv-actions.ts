"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface SaleItem {
  product_id?: string
  description: string
  quantity: number
  unit_price: number
}

interface CreateSaleDTO {
  customer_id?: string
  service_order_id?: string
  items: SaleItem[]
  payment_method_id: string
  discount?: number
  notes?: string
}

interface ActionResult {
  success: boolean
  message: string
  data?: { id: string }
}

export async function createSale(data: CreateSaleDTO): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Usuário não autenticado" }
    }

    // Buscar método de pagamento para calcular taxa
    const { data: paymentMethod } = await supabase
      .from("payment_methods")
      .select("fee_percentage")
      .eq("id", data.payment_method_id)
      .single()

    // Calcular valores
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
    const discount = data.discount || 0
    const total = subtotal - discount
    const feePercentage = paymentMethod?.fee_percentage || 0
    const paymentFee = (total * feePercentage) / 100
    const netTotal = total - paymentFee

    // Criar venda
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        customer_id: data.customer_id || null,
        service_order_id: data.service_order_id || null,
        user_id: user.id,
        subtotal,
        discount,
        total,
        payment_method_id: data.payment_method_id,
        payment_fee: paymentFee,
        net_total: netTotal,
        notes: data.notes || null,
      })
      .select("id")
      .single()

    if (saleError) {
      console.error("Error creating sale:", saleError)
      return { success: false, message: "Erro ao criar venda" }
    }

    // Criar itens da venda
    const saleItems = data.items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems)

    if (itemsError) {
      console.error("Error creating sale items:", itemsError)
    }

    // Atualizar estoque dos produtos
    for (const item of data.items) {
      if (item.product_id) {
        await supabase.rpc("decrement_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        })
      }
    }

    // Criar transação de caixa
    await supabase.from("cash_transactions").insert({
      type: "income",
      sale_id: sale.id,
      description: `Venda #${sale.id.slice(0, 8)}`,
      amount: netTotal,
      user_id: user.id,
      is_paid: true,
      paid_at: new Date().toISOString(),
    })

    revalidatePath("/admin/pdv")
    revalidatePath("/admin/financial")

    return {
      success: true,
      message: "Venda realizada com sucesso!",
      data: { id: sale.id },
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado ao criar venda" }
  }
}

export async function searchProducts(query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("id, name, barcode, sale_price, stock_quantity")
    .eq("is_active", true)
    .or(`name.ilike.%${query}%,barcode.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error("Error searching products:", error)
    return []
  }

  return data
}

export async function getProductByBarcode(barcode: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("id, name, barcode, sale_price, stock_quantity")
    .eq("barcode", barcode)
    .eq("is_active", true)
    .single()

  if (error) return null
  return data
}
