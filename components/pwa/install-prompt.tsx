"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Share, Plus, MoreVertical, ChevronUp } from "lucide-react"

// ------------------------------------------------------------------ //
// Tipos auxiliares
// ------------------------------------------------------------------ //

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type Platform = "ios" | "android" | "desktop" | "unknown"

// ------------------------------------------------------------------ //
// Constantes
// ------------------------------------------------------------------ //

const DISMISS_KEY = "pwa-install-dismissed"
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 dias

// ------------------------------------------------------------------ //
// Helpers de deteccao
// ------------------------------------------------------------------ //

function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  const mq = window.matchMedia("(display-mode: standalone)")
  const nav = navigator as unknown as { standalone?: boolean }
  return mq.matches || nav.standalone === true
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "unknown"
  const ua = navigator.userAgent || ""
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (isIOS) return "ios"
  if (/android/i.test(ua)) return "android"
  if (/Windows|Macintosh|Linux/.test(ua) && navigator.maxTouchPoints <= 1) return "desktop"
  return "unknown"
}

function wasDismissedRecently(): boolean {
  if (typeof localStorage === "undefined") return false
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const ts = Number(raw)
  if (Number.isNaN(ts)) return false
  return Date.now() - ts < DISMISS_DURATION_MS
}

function saveDismiss(): void {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {
    // quota excedida - ignora
  }
}

// ------------------------------------------------------------------ //
// Componente principal
// ------------------------------------------------------------------ //

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>("unknown")
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)

  // ---- escuta o evento nativo (Chrome / Edge / Samsung Internet) ---- //
  useEffect(() => {
    if (typeof window === "undefined") return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  // ---- decide se deve exibir o banner ---- //
  useEffect(() => {
    if (typeof window === "undefined") return

    // Ja esta instalado
    if (isStandalone()) return

    // Usuario dispensou recentemente
    if (wasDismissedRecently()) return

    const plat = detectPlatform()
    setPlatform(plat)

    // No iOS sempre mostra (nao existe beforeinstallprompt)
    // No Android/desktop mostra se ha prompt nativo OU se e mobile
    if (plat === "ios") {
      setVisible(true)
    } else if (deferredPrompt) {
      setVisible(true)
    } else if (plat === "android") {
      // Alguns browsers Android nao disparam beforeinstallprompt
      // Mostra instrucoes manuais apos 3s
      const timer = setTimeout(() => {
        if (!isStandalone() && !wasDismissedRecently()) {
          setVisible(true)
        }
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [deferredPrompt])

  // ---- instalar via prompt nativo ---- //
  const handleNativeInstall = useCallback(async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === "accepted") {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }, [deferredPrompt])

  // ---- dispensar ---- //
  const handleDismiss = useCallback(() => {
    saveDismiss()
    setVisible(false)
    setShowInstructions(false)
  }, [])

  if (!visible) return null

  // ================================================================ //
  // iOS: instrucoes passo-a-passo
  // ================================================================ //
  if (platform === "ios") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[9999] pwa-safe-bottom animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-lg px-4 pb-4">
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-xl">
            {/* Botao fechar */}
            <button
              onClick={handleDismiss}
              aria-label="Fechar"
              className="absolute right-3 top-3 rounded-full p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d4f] to-[#b00000]">
                <Download className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Instale o Saymon Cell
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Acesse o painel direto da tela inicial do seu iPhone
                </p>
              </div>
            </div>

            {!showInstructions ? (
              <Button
                onClick={() => setShowInstructions(true)}
                className="mt-3 w-full rounded-xl"
                size="sm"
              >
                Como instalar
              </Button>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-neutral-900 p-3 space-y-3">
                  <Step
                    number={1}
                    icon={<Share className="size-4 text-[#ff0200]" />}
                    text='Toque no botao "Compartilhar" na barra do Safari'
                  />
                  <Step
                    number={2}
                    icon={<Plus className="size-4 text-[#ff0200]" />}
                    text='Role e toque em "Adicionar a Tela de Inicio"'
                  />
                  <Step
                    number={3}
                    icon={<ChevronUp className="size-4 text-[#ff0200]" />}
                    text='Confirme tocando em "Adicionar"'
                  />
                </div>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full rounded-xl text-neutral-400 hover:text-white"
                  size="sm"
                >
                  Entendi, fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ================================================================ //
  // Android com prompt nativo
  // ================================================================ //
  if (deferredPrompt) {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[9999] pwa-safe-bottom animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-lg px-4 pb-4">
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-xl">
            <button
              onClick={handleDismiss}
              aria-label="Fechar"
              className="absolute right-3 top-3 rounded-full p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d4f] to-[#b00000]">
                <Download className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Instale o Saymon Cell
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Acesse rapido direto da tela inicial do seu celular
                </p>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleNativeInstall}
                className="flex-1 rounded-xl"
                size="sm"
              >
                <Download className="mr-1.5 size-4" />
                Instalar app
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                className="rounded-xl text-neutral-400 hover:text-white"
                size="sm"
              >
                Agora nao
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ================================================================ //
  // Android sem prompt nativo (Samsung Internet, Firefox, etc.)
  // ================================================================ //
  if (platform === "android") {
    return (
      <div className="fixed inset-x-0 bottom-0 z-[9999] pwa-safe-bottom animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto max-w-lg px-4 pb-4">
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-xl">
            <button
              onClick={handleDismiss}
              aria-label="Fechar"
              className="absolute right-3 top-3 rounded-full p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d4f] to-[#b00000]">
                <Download className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">
                  Instale o Saymon Cell
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  Acesse rapido direto da tela inicial
                </p>
              </div>
            </div>

            {!showInstructions ? (
              <Button
                onClick={() => setShowInstructions(true)}
                className="mt-3 w-full rounded-xl"
                size="sm"
              >
                Como instalar
              </Button>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl bg-neutral-900 p-3 space-y-3">
                  <Step
                    number={1}
                    icon={<MoreVertical className="size-4 text-[#ff0200]" />}
                    text="Toque no menu do navegador (tres pontos)"
                  />
                  <Step
                    number={2}
                    icon={<Plus className="size-4 text-[#ff0200]" />}
                    text='Selecione "Adicionar a tela inicial" ou "Instalar app"'
                  />
                  <Step
                    number={3}
                    icon={<ChevronUp className="size-4 text-[#ff0200]" />}
                    text='Confirme tocando em "Adicionar"'
                  />
                </div>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full rounded-xl text-neutral-400 hover:text-white"
                  size="sm"
                >
                  Entendi, fechar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Desktop ou desconhecido - nao mostra nada
  return null
}

// ------------------------------------------------------------------ //
// Sub-componente de passo
// ------------------------------------------------------------------ //

function Step({
  number,
  icon,
  text,
}: {
  number: number
  icon: React.ReactNode
  text: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-bold text-neutral-300">
        {number}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs text-neutral-300">{text}</span>
      </div>
    </div>
  )
}
