"use client"

// Convite para instalar o painel como app (PWA), no celular: o botão nativo onde o navegador
// oferece (Chrome, Edge, Samsung Internet) e os passos onde não oferece (Safari, Firefox). Some por
// 7 dias quando a pessoa dispensa.

import type React from "react"
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
  // Desktop ou desconhecido: nada a mostrar
  if (platform !== "ios" && platform !== "android" && !deferredPrompt) return null

  const steps =
    platform === "ios"
      ? [
          { icon: <Share className="size-4" />, text: "Toque em Compartilhar, na barra do Safari." },
          { icon: <Plus className="size-4" />, text: "Escolha Adicionar à Tela de Início." },
          { icon: <ChevronUp className="size-4" />, text: "Confirme em Adicionar." },
        ]
      : [
          { icon: <MoreVertical className="size-4" />, text: "Toque no menu do navegador, nos três pontos." },
          { icon: <Plus className="size-4" />, text: "Escolha Adicionar à tela inicial ou Instalar app." },
          { icon: <ChevronUp className="size-4" />, text: "Confirme em Adicionar." },
        ]

  // A notificação da tela de bloqueio da home: desce logo abaixo da barra do topo, sem cobrir a
  // barra de abas, com o ícone do app (o glifo sobre o vermelho). No computador, no canto de baixo.
  return (
    <div
      role="dialog"
      aria-labelledby="pwa-install-title"
      className="fixed inset-x-3 top-[calc(4rem+var(--sat)+8px)] z-[70] mx-auto max-w-[460px] animate-in fade-in-0 slide-in-from-top-4 duration-300 lg:inset-x-auto lg:top-auto lg:right-6 lg:bottom-6 lg:w-[380px] lg:slide-in-from-bottom-4"
    >
      <div className="rounded-[18px] bg-[rgba(244,243,240,0.96)] p-2.5 text-sc-ink shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06),0_10px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-[20px]">
        <div className="grid grid-cols-[42px_minmax(0,1fr)_auto] items-center gap-3">
          <span className="grid size-[42px] place-items-center rounded-[10px] bg-sc-red">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/glyph.png" alt="" className="h-[64%] w-auto" />
          </span>
          <span className="min-w-0">
            <span id="pwa-install-title" className="block text-[13px] font-semibold leading-[1.3]">
              Instale o painel no celular
            </span>
            <span className="block font-mono text-[11px] font-medium uppercase leading-[1.25] tracking-[0.06em] text-[#4d4a46]">
              Saymon Cell · abre da tela de início
            </span>
          </span>
          <button
            onClick={handleDismiss}
            aria-label="Agora não"
            className="grid size-9 place-items-center rounded-full text-[#4d4a46] transition-colors hover:bg-black/[0.06] hover:text-sc-ink"
          >
            <X className="size-4" />
          </button>
        </div>

        {deferredPrompt ? (
          <div className="mt-2.5 flex gap-2">
            <Button onClick={handleNativeInstall} className="flex-1" size="sm">
              <Download className="size-4" />
              Instalar o app
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-[#4d4a46] hover:bg-black/[0.06] hover:text-sc-ink">
              Agora não
            </Button>
          </div>
        ) : !showInstructions ? (
          <Button onClick={() => setShowInstructions(true)} className="mt-2.5 w-full" size="sm">
            Como instalar
          </Button>
        ) : (
          <div className="mt-2.5 grid gap-2">
            <ol className="grid gap-1 rounded-[14px] bg-black/[0.05] p-2">
              {steps.map((step, i) => (
                <Step key={i} number={i + 1} icon={step.icon} text={step.text} />
              ))}
            </ol>
            <Button onClick={handleDismiss} variant="ghost" size="sm" className="text-[#4d4a46] hover:bg-black/[0.06] hover:text-sc-ink">
              Entendi
            </Button>
          </div>
        )}
      </div>
    </div>
  )
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
    <li className="flex items-center gap-3 rounded-[10px] px-2 py-1.5">
      <span className="font-mono text-[11px] font-medium tracking-[0.06em] text-sc-red-strong">
        {String(number).padStart(2, "0")}
      </span>
      <span className="text-sc-red-strong">{icon}</span>
      <span className="text-[13px] leading-[1.35]">{text}</span>
    </li>
  )
}
