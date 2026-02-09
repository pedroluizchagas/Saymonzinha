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
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "::1"

    const swUrl = "/sw.js"

    // Escopo global para que o SW cubra todas as rotas necessarias
    // Isso e importante para o PWA funcionar corretamente no iOS
    const scope = "/"

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register(swUrl, {
          scope,
          updateViaCache: "none",
        })

        // Ativa imediatamente se ha um worker em espera
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" })
        }

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // Nova versao disponivel - ativa automaticamente
              newWorker.postMessage({ type: "SKIP_WAITING" })
            }
          })
        })

        // Recarrega a pagina quando o novo SW assume o controle
        let refreshing = false
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return
          refreshing = true
          window.location.reload()
        })
      } catch (err) {
        if (!isLocalhost) {
          console.error("Service Worker registration failed:", err)
        }
      }
    }

    // Registra apos o carregamento completo da pagina
    if (document.readyState === "complete") {
      register()
    } else {
      window.addEventListener("load", register)
      return () => window.removeEventListener("load", register)
    }
  }, [])

  return null
}
