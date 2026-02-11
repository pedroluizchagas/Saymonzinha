"use client"

import { useEffect, useCallback, useState, useRef } from "react"

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

export type PushStatus =
  | "loading"
  | "unsupported"
  | "denied"
  | "prompt"
  | "subscribed"
  | "unsubscribed"

export function usePushSubscription() {
  const [status, setStatus] = useState<PushStatus>("loading")
  const [busy, setBusy] = useState(false)
  const hasAutoSubscribed = useRef(false)

  // -- helpers internos --------------------------------------------------

  const doSubscribe = useCallback(async () => {
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

    return response.ok
  }, [])

  // -- verificacao inicial ------------------------------------------------

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
      if (!hasAutoSubscribed.current) {
        hasAutoSubscribed.current = true
        doSubscribe()
          .then((ok) => setStatus(ok ? "subscribed" : "unsubscribed"))
          .catch(() => setStatus("unsubscribed"))
      }
      return
    }

    setStatus("prompt")
  }, [doSubscribe])

  // -- acoes publicas -----------------------------------------------------

  /** Solicita permissao (se necessario) e inscreve no push. */
  const subscribe = useCallback(async () => {
    if (status !== "prompt" && status !== "unsubscribed") return

    try {
      setBusy(true)

      const permission = await Notification.requestPermission()

      if (permission === "denied") {
        setStatus("denied")
        return
      }

      if (permission !== "granted") return

      const ok = await doSubscribe()
      if (ok) setStatus("subscribed")
    } catch (err) {
      console.error("[usePushSubscription] Erro ao inscrever:", err)
    } finally {
      setBusy(false)
    }
  }, [status, doSubscribe])

  /** Remove a inscricao push do navegador e do servidor. */
  const unsubscribe = useCallback(async () => {
    if (status !== "subscribed") return

    try {
      setBusy(true)

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
      console.error("[usePushSubscription] Erro ao desinscrever:", err)
    } finally {
      setBusy(false)
    }
  }, [status])

  return { status, busy, subscribe, unsubscribe }
}
