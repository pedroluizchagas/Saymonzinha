"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { Bell, BellOff, BellRing } from "lucide-react"
import { cn } from "@/lib/utils"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

type NotifStatus = "loading" | "unsupported" | "denied" | "prompt" | "subscribed" | "unsubscribed"

export function NotificationManager() {
  const [status, setStatus] = useState<NotifStatus>("loading")
  const [animating, setAnimating] = useState(false)
  const hasAutoSubscribed = useRef(false)

  // Verificar estado atual ao montar
  useEffect(() => {
    if (typeof window === "undefined") return

    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window

    if (!supported || !VAPID_PUBLIC_KEY) {
      setStatus("unsupported")
      return
    }

    const permission = Notification.permission

    if (permission === "denied") {
      setStatus("denied")
      return
    }

    if (permission === "granted") {
      // Auto-subscribe se permissao ja concedida
      if (!hasAutoSubscribed.current) {
        hasAutoSubscribed.current = true
        autoSubscribe()
      }
      return
    }

    // Permissao nao solicitada ainda
    setStatus("prompt")
  }, [])

  const autoSubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
        })
      }

      // Salvar no servidor
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (response.ok) {
        setStatus("subscribed")
      } else {
        setStatus("unsubscribed")
      }
    } catch (err) {
      console.error("[NotificationManager] Erro ao auto-subscribe:", err)
      setStatus("unsubscribed")
    }
  }

  const handleClick = useCallback(async () => {
    if (status === "unsupported" || status === "denied" || status === "loading") {
      return
    }

    if (status === "subscribed") {
      // Desinscrever
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()

        if (subscription) {
          await fetch("/api/notifications/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          })
          await subscription.unsubscribe()
        }

        setStatus("unsubscribed")
      } catch (err) {
        console.error("[NotificationManager] Erro ao desinscrever:", err)
      }
      return
    }

    // Solicitar permissao e inscrever
    try {
      setAnimating(true)

      const permission = await Notification.requestPermission()

      if (permission === "denied") {
        setStatus("denied")
        setAnimating(false)
        return
      }

      if (permission !== "granted") {
        setAnimating(false)
        return
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
        })
      }

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      })

      if (response.ok) {
        setStatus("subscribed")
      }
    } catch (err) {
      console.error("[NotificationManager] Erro ao inscrever:", err)
    } finally {
      setAnimating(false)
    }
  }, [status])

  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Carregando..."
      case "unsupported":
        return "Notificacoes nao suportadas neste navegador"
      case "denied":
        return "Notificacoes bloqueadas - altere nas configuracoes do navegador"
      case "subscribed":
        return "Notificacoes ativadas - clique para desativar"
      case "prompt":
      case "unsubscribed":
        return "Ativar notificacoes push"
      default:
        return ""
    }
  }

  const isClickable = status === "prompt" || status === "subscribed" || status === "unsubscribed"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isClickable}
      title={getTitle()}
      aria-label={getTitle()}
      className={cn(
        "relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200",
        isClickable && "cursor-pointer hover:scale-110 hover:bg-secondary/50 active:scale-95",
        !isClickable && "cursor-default opacity-60",
        animating && "animate-pulse"
      )}
    >
      {status === "subscribed" ? (
        <Bell className="w-5 h-5 text-primary" />
      ) : status === "denied" ? (
        <BellOff className="w-5 h-5 text-muted-foreground" />
      ) : (
        <Bell className="w-5 h-5 text-muted-foreground" />
      )}

      {/* Indicador de status */}
      {status === "subscribed" && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
      )}
      {(status === "prompt" || status === "unsubscribed") && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-card animate-pulse" />
      )}
      {status === "denied" && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-card" />
      )}
    </button>
  )
}
