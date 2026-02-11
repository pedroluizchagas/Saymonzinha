"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { NotificationType } from "@/types/database"

interface CreateNotificationDTO {
  type: NotificationType
  title: string
  body: string
  url?: string
  metadata?: Record<string, unknown>
}

// Cria uma notificacao no banco (usa admin client para bypass de RLS)
export async function createNotification(data: CreateNotificationDTO) {
  try {
    const supabase = createAdminClient()

    const { data: notification, error } = await supabase
      .from("notifications")
      .insert({
        type: data.type,
        title: data.title,
        body: data.body,
        url: data.url || "/admin",
        metadata: data.metadata || {},
      })
      .select("id")
      .single()

    if (error) {
      console.error("[Notification] Erro ao criar:", error.message)
      return null
    }

    return notification
  } catch (error) {
    console.error("[Notification] Erro inesperado:", error)
    return null
  }
}

// Busca notificacoes com status de leitura para o usuario atual
export async function getNotifications(limit = 30) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { notifications: [], unreadCount: 0 }

    // Buscar notificacoes recentes
    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("[Notification] Erro ao buscar:", error.message)
      return { notifications: [], unreadCount: 0 }
    }

    // Buscar quais o usuario ja leu
    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id)

    const readIds = new Set(reads?.map((r) => r.notification_id) || [])

    const withReadStatus = (notifications || []).map((n) => ({
      ...n,
      is_read: readIds.has(n.id),
    }))

    const unreadCount = withReadStatus.filter((n) => !n.is_read).length

    return { notifications: withReadStatus, unreadCount }
  } catch (error) {
    console.error("[Notification] Erro inesperado:", error)
    return { notifications: [], unreadCount: 0 }
  }
}

// Marca uma notificacao como lida
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    const { error } = await supabase.from("notification_reads").upsert(
      {
        notification_id: notificationId,
        user_id: user.id,
      },
      { onConflict: "notification_id,user_id" }
    )

    if (error) {
      console.error("[Notification] Erro ao marcar como lida:", error.message)
      return false
    }

    return true
  } catch (error) {
    console.error("[Notification] Erro inesperado:", error)
    return false
  }
}

// Marca todas as notificacoes como lidas
export async function markAllNotificationsAsRead() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return false

    // Buscar IDs de notificacoes nao lidas
    const { data: notifications } = await supabase
      .from("notifications")
      .select("id")

    if (!notifications || notifications.length === 0) return true

    // Buscar quais ja foram lidas
    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", user.id)

    const readIds = new Set(reads?.map((r) => r.notification_id) || [])
    const unreadIds = notifications.filter((n) => !readIds.has(n.id)).map((n) => n.id)

    if (unreadIds.length === 0) return true

    // Inserir leituras para todas as nao lidas
    const inserts = unreadIds.map((nId) => ({
      notification_id: nId,
      user_id: user.id,
    }))

    const { error } = await supabase.from("notification_reads").upsert(inserts, {
      onConflict: "notification_id,user_id",
    })

    if (error) {
      console.error("[Notification] Erro ao marcar todas como lidas:", error.message)
      return false
    }

    return true
  } catch (error) {
    console.error("[Notification] Erro inesperado:", error)
    return false
  }
}
