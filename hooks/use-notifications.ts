"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notification-actions"
import type { NotificationWithReadStatus } from "@/types/database"

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationWithReadStatus[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>["channel"]> | null>(null)

  // Carregar notificacoes iniciais
  const fetchNotifications = useCallback(async () => {
    try {
      const result = await getNotifications(30)
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
    } catch (error) {
      console.error("[useNotifications] Erro ao buscar:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Marcar uma como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId)
    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    }
    return success
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    const success = await markAllNotificationsAsRead()
    if (success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
    return success
  }, [])

  // Inscrever no Supabase Realtime para novas notificacoes
  useEffect(() => {
    fetchNotifications()

    const supabase = createClient()

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          const newNotification = {
            ...payload.new,
            is_read: false,
          } as NotificationWithReadStatus

          setNotifications((prev) => [newNotification, ...prev].slice(0, 30))
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    channelRef.current = channel

    // Ouvir mensagens do Service Worker (push recebido em background)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "PUSH_RECEIVED") {
        // Recarregar notificacoes quando push chega (pode ter sido persistido)
        fetchNotifications()
      }
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleSWMessage)
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleSWMessage)
      }
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  }
}
