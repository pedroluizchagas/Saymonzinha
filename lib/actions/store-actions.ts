"use server"

import { createClient } from "@/lib/supabase/server"
import type { Product } from "@/types/database"

// =====================================================
// ACTIONS DA LOJA VIRTUAL - SAYMON CELL
// Seguindo Clean Architecture: Camada de Use Cases
// =====================================================

export async function getStoreProducts(): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("show_in_store", true)
    .gt("stock_quantity", 0)
    .order("name")

  if (error) {
    console.error("Erro ao buscar produtos da loja:", error)
    return []
  }

  return data || []
}

export async function getStoreProductsByCategory(category: string): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("show_in_store", true)
    .eq("category", category)
    .gt("stock_quantity", 0)
    .order("name")

  if (error) {
    console.error("Erro ao buscar produtos por categoria:", error)
    return []
  }

  return data || []
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("show_in_store", true)
    .gt("stock_quantity", 0)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Erro ao buscar produtos em destaque:", error)
    return []
  }

  return data || []
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).eq("is_active", true).single()

  if (error) {
    console.error("Erro ao buscar produto:", error)
    return null
  }

  return data
}
