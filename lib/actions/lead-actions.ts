"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import type { CreateLeadDTO } from "@/types/database"
import { notifyNewLead } from "@/lib/notifications"

interface ActionResult {
  success: boolean
  message: string
  data?: { id: string }
}

export async function createLead(data: CreateLeadDTO): Promise<ActionResult> {
  try {
    // Usa o admin client (service role) para bypass de RLS,
    // pois leads sao criados por visitantes nao autenticados.
    // Seguro porque esta server action valida os dados antes de inserir.
    const supabase = createAdminClient()

    const { data: lead, error } = await supabase
      .from("leads")
      .insert({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        device_brand: data.device_brand,
        device_model: data.device_model,
        device_password: data.device_password || null,
        problem_type: data.problem_type,
        problem_description: data.problem_description || null,
        delivery_type: data.delivery_type,
        delivery_address: data.delivery_address || null,
        status: "pending",
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating lead:", error)
      return {
        success: false,
        message: "Erro ao enviar orcamento. Tente novamente.",
      }
    }

    // Notificar admins sobre o novo lead (fire-and-forget)
    notifyNewLead(
      data.customer_name,
      `${data.device_brand} ${data.device_model}`
    ).catch((err) => console.error("[Lead] Erro ao enviar notificacao:", err))

    return {
      success: true,
      message: "Orcamento enviado com sucesso! Entraremos em contato em breve.",
      data: { id: lead.id },
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return {
      success: false,
      message: "Erro inesperado. Por favor, tente novamente.",
    }
  }
}
