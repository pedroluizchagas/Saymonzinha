"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface CreateCustomerDTO {
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
}

interface ActionResult {
  success: boolean
  message: string
  data?: { id: string }
}

export async function createCustomer(data: CreateCustomerDTO): Promise<ActionResult> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "Usuário não autenticado" }
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .insert({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error creating customer:", error)
      return { success: false, message: "Erro ao criar cliente" }
    }

    revalidatePath("/admin/customers")

    return {
      success: true,
      message: "Cliente cadastrado com sucesso!",
      data: { id: customer.id },
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { success: false, message: "Erro inesperado" }
  }
}

export async function searchCustomers(query: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone")
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(10)

  if (error) {
    console.error("Error searching customers:", error)
    return []
  }

  return data
}
