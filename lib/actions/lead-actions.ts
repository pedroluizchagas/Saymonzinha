"use server"

import { createClient } from "@/lib/supabase/server"
import type { CreateLeadDTO } from "@/types/database"

interface ActionResult {
  success: boolean
  message: string
  data?: { id: string }
}

export async function createLead(data: CreateLeadDTO): Promise<ActionResult> {
  try {
    const supabase = await createClient()

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
        message: "Erro ao enviar orçamento. Tente novamente.",
      }
    }

    return {
      success: true,
      message: "Orçamento enviado com sucesso! Entraremos em contato em breve.",
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
