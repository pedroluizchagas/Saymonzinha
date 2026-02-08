"use server"

import { createClient } from "@/lib/supabase/server"
import type {
  CreateServiceOrderDTO,
  UpdateServiceOrderDTO,
  ServiceOrderStatus,
  ServiceOrderItem,
  Product,
} from "@/types/database"
import { revalidatePath } from "next/cache"

interface ActionResult {
  success: boolean
  message: string
  data?: { id: string }
}

export async function createServiceOrder(data: CreateServiceOrderDTO): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Usuário não autenticado" }
    }

    const { data: order, error } = await supabase
      .from("service_orders")
      .insert({
        customer_id: data.customer_id,
        device_brand: data.device_brand,
        device_model: data.device_model,
        device_password: data.device_password || null,
        device_imei: data.device_imei || null,
        device_color: data.device_color || null,
        problem_description: data.problem_description,
        problem_type_id: data.problem_type_id || null,
        delivery_type: data.delivery_type,
        delivery_address: data.delivery_address || null,
        estimated_price: data.estimated_price || null,
        status: "awaiting_device",
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating service order:", error)
      return { success: false, message: "Erro ao criar ordem de serviço" }
    }

    // Registrar histórico
    await supabase.from("service_order_history").insert({
      service_order_id: order.id,
      user_id: user.id,
      new_status: "awaiting_device",
      notes: "Ordem de serviço criada",
    })

    revalidatePath("/admin/orders")

    return {
      success: true,
      message: "Ordem de serviço criada com sucesso!",
      data: { id: order.id },
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado ao criar ordem de serviço" }
  }
}

export async function updateServiceOrderStatus(
  orderId: string,
  newStatus: ServiceOrderStatus,
  notes?: string,
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Usuário não autenticado" }
    }

    // Buscar status atual
    const { data: currentOrder } = await supabase.from("service_orders").select("status").eq("id", orderId).single()

    const updateData: Record<string, string | null> = { status: newStatus }

    // Atualizar datas conforme o status
    if (newStatus === "in_analysis" && !currentOrder?.status?.includes("in_analysis")) {
      updateData.received_at = new Date().toISOString()
    }
    if (newStatus === "in_repair") {
      updateData.approved_at = new Date().toISOString()
    }
    if (newStatus === "ready") {
      updateData.completed_at = new Date().toISOString()
    }
    if (newStatus === "delivered") {
      updateData.delivered_at = new Date().toISOString()
    }

    const { error } = await supabase.from("service_orders").update(updateData).eq("id", orderId)

    if (error) {
      console.error("Error updating order status:", error)
      return { success: false, message: "Erro ao atualizar status" }
    }

    // Registrar histórico
    await supabase.from("service_order_history").insert({
      service_order_id: orderId,
      user_id: user.id,
      previous_status: currentOrder?.status || null,
      new_status: newStatus,
      notes: notes || null,
    })

    revalidatePath("/admin/orders")

    return { success: true, message: "Status atualizado com sucesso!" }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}

export async function updateServiceOrder(orderId: string, data: UpdateServiceOrderDTO): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Usuário não autenticado" }
    }

    const { error } = await supabase.from("service_orders").update(data).eq("id", orderId)

    if (error) {
      console.error("Error updating order:", error)
      return { success: false, message: "Erro ao atualizar ordem de serviço" }
    }

    revalidatePath("/admin/orders")

    return { success: true, message: "Ordem de serviço atualizada!" }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}

// ============================
// Itens da Ordem de Serviço
// ============================

export async function getServiceOrderItems(orderId: string): Promise<ServiceOrderItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("service_order_items")
    .select("*, product:products(*)")
    .eq("service_order_id", orderId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching service order items:", error)
    return []
  }
  return (data as ServiceOrderItem[]) || []
}

export async function addServiceOrderItem(
  orderId: string,
  productId: string,
  quantity = 1,
): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { success: false, message: "Usuário não autenticado" }

    const { data: product } = await supabase.from("products").select("*").eq("id", productId).single()
    if (!product) return { success: false, message: "Produto não encontrado" }

    const p = product as Product
    const unit = Number(p.sale_price || 0)
    const total = unit * quantity

    const { data: item, error: insertError } = await supabase
      .from("service_order_items")
      .insert({
        service_order_id: orderId,
        product_id: productId,
        description: p.name,
        quantity,
        unit_price: unit,
        total_price: total,
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("Error adding service order item:", insertError)
      return { success: false, message: "Erro ao adicionar item" }
    }

    await recomputePartsCost(orderId)

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true, message: "Item adicionado", data: { id: item.id } }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}

export async function removeServiceOrderItem(orderId: string, itemId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Usuário não autenticado" }

    const { error } = await supabase.from("service_order_items").delete().eq("id", itemId)
    if (error) {
      console.error("Error removing service order item:", error)
      return { success: false, message: "Erro ao remover item" }
    }

    await recomputePartsCost(orderId)

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true, message: "Item removido" }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}

export async function updateServiceOrderItemQuantity(
  orderId: string,
  itemId: string,
  quantity: number,
): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, message: "Usuário não autenticado" }

    const { data: current } = await supabase.from("service_order_items").select("unit_price").eq("id", itemId).single()
    const unit = Number(current?.unit_price || 0)
    const total = unit * quantity

    const { error } = await supabase
      .from("service_order_items")
      .update({ quantity, total_price: total })
      .eq("id", itemId)

    if (error) {
      console.error("Error updating item quantity:", error)
      return { success: false, message: "Erro ao atualizar quantidade" }
    }

    await recomputePartsCost(orderId)

    revalidatePath(`/admin/orders/${orderId}`)
    revalidatePath("/admin/orders")
    return { success: true, message: "Quantidade atualizada" }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}

async function recomputePartsCost(orderId: string) {
  const supabase = await createClient()
  const { data: items } = await supabase
    .from("service_order_items")
    .select("total_price, product:products(category)")
    .eq("service_order_id", orderId)

  const sum =
    items?.reduce((acc, it) => {
      // @ts-ignore
      const category = it.product?.category as Product["category"] | undefined
      return acc + (category === "part" ? Number(it.total_price || 0) : 0)
    }, 0) || 0

  await supabase.from("service_orders").update({ parts_cost: sum }).eq("id", orderId)
}

export async function uploadServiceNoteImage(
  orderNumber: string | number,
  dataUrl: string,
): Promise<{ success: boolean; message: string; url?: string }> {
  try {
    const supabase = await createClient()
    const base64 = dataUrl.split(",")[1] || ""
    const buffer = Buffer.from(base64, "base64")
    const uint8 = new Uint8Array(buffer)
    const folder = "service_notes"
    const ts = Date.now()
    const path = `${folder}/os-${orderNumber}-${ts}.png`
    const { error } = await supabase.storage.from("avatar_profire").upload(path, uint8, {
      contentType: "image/png",
      upsert: true,
    })
    if (error) {
      console.error("Error uploading service note image:", error)
      return { success: false, message: "Erro ao enviar imagem" }
    }
    const { data } = supabase.storage.from("avatar_profire").getPublicUrl(path)
    const url = data.publicUrl
    return { success: true, message: "Imagem enviada", url }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}
