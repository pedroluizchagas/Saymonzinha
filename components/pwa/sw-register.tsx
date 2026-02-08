"use client"

import { useEffect } from "react"

export function SWRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("serviceWorker" in navigator)) return

    const pathname = window.location.pathname
    const isAdmin = pathname.startsWith("/admin")
    const isAuth = pathname.startsWith("/auth")
    if (!isAdmin && !isAuth) return

    const isLocalhost =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname === "::1"

    const swUrl = "/sw.js"
    const scope = isAdmin ? "/admin" : "/auth"

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(swUrl, { scope })
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                /* noop */
              }
            }
          })
        })
      } catch (err) {
        if (!isLocalhost) {
          console.error("Service Worker registration failed:", err)
        }
      }
    }

    window.addEventListener("load", register)
    return () => window.removeEventListener("load", register)
  }, [])

  return null
}
