"use server"

import { createClient } from "@/lib/supabase/server"
import type { CreateServiceOrderDTO, UpdateServiceOrderDTO, ServiceOrderStatus } from "@/types/database"
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
