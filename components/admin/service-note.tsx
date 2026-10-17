"use client"

import { useEffect, useRef, useState } from "react"
import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ServiceOrder, ServiceOrderItem } from "@/types/database"
import { toPng } from "html-to-image"
import { Loader2, Download, MessageCircle, ExternalLink } from "lucide-react"
import { uploadServiceNoteImage } from "@/lib/actions/service-order-actions"
import { useClock } from "@/components/home/shared/device-ui"

// Dimensoes da imagem exportada (simula tela de smartphone)
const IMG_W = 390
const IMG_H = 844

// O aparelho da prévia: a nota mais a moldura (aro de 4px e borda de 9px de cada lado)
const DEVICE_W = IMG_W + 26

// Safe areas simuladas (compativel com iPhone 14/15 Pro)
const SAFE_TOP = 54 // barra de status (notch / dynamic island)
const SAFE_BOTTOM = 34 // home indicator

interface ServiceNoteProps {
  order: ServiceOrder
  items?: ServiceOrderItem[]
}


export function ServiceNote({ order, items = [] }: ServiceNoteProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  // A hora de Divinópolis, a mesma da home: fixa no servidor e atualizada no navegador (sem divergir na hidratação).
  const time = useClock()
  const [exporting, setExporting] = useState(false)
  const [sending, setSending] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)
  // No celular o aparelho não cabe no cartão: a prévia encolhe por inteiro (a imagem exportada não muda,
  // porque só a tela, sem o transform de fora, vira imagem).
  const frameRef = useRef<HTMLDivElement | null>(null)
  const deviceRef = useRef<HTMLDivElement | null>(null)
  const [fit, setFit] = useState({ scale: 1, height: 0 })

  useEffect(() => {
    const frame = frameRef.current
    const device = deviceRef.current
    if (!frame || !device) return
    const observer = new ResizeObserver(() => {
      setFit({ scale: Math.min(1, frame.clientWidth / DEVICE_W), height: device.offsetHeight })
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [])

  const formatCurrency = (v: number | null | undefined) => {
    if (v == null) return "—"
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
  }

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })
    } catch {
      return "-"
    }
  }

  const handleExport = async () => {
    if (!ref.current) return
    setExporting(true)
    try {
      const dataUrl = await toPng(ref.current, {
        width: IMG_W,
        height: IMG_H,
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0a0908",
      })

      const link = document.createElement("a")
      link.download = `nota-os-${order.order_number}.png`
      link.href = dataUrl
      link.click()
    } finally {
      setExporting(false)
    }
  }

  const buildWhatsAppUrl = async (): Promise<string> => {
    if (!ref.current) throw new Error("Referencia do componente indisponivel")

    const dataUrl = await toPng(ref.current, {
      width: IMG_W,
      height: IMG_H,
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: "#0a0908",
    })
    const upload = await uploadServiceNoteImage(order.order_number, dataUrl)
    const url = upload.url || ""
    const msg = `Olha! Segue a Nota de Servico da OS #${order.order_number}:\n${url}`
    const phone = formatWhatsAppPhone(order.customer?.phone || "")
    return phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
  }

  const isMobileDevice = () => {
    if (typeof navigator === "undefined") return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  }

  const handleSendWhatsApp = async () => {
    if (!ref.current) return
    setSending(true)
    setWhatsappUrl(null)

    try {
      // No desktop, pre-abre uma aba durante o gesto do usuario (funciona bem)
      // No mobile, pop-ups sao bloqueados; usamos navegacao direta depois
      const isMobile = isMobileDevice()
      let preOpened: Window | null = null

      if (!isMobile) {
        preOpened = window.open("", "_blank")
      }

      const wa = await buildWhatsAppUrl()

      // Desktop: redireciona a aba pre-aberta
      if (preOpened && !preOpened.closed) {
        try {
          preOpened.location.href = wa
          return
        } catch {
          // Se falhar, fecha a aba e usa o fallback
          try { preOpened.close() } catch { /* ignora */ }
        }
      }

      // Mobile: navegacao direta abre o app do WhatsApp
      if (isMobile) {
        window.location.href = wa
        return
      }

      // Fallback desktop (caso pre-open tenha sido bloqueado):
      // Mostra link clicavel para o usuario abrir manualmente
      setWhatsappUrl(wa)
    } catch {
      setWhatsappUrl(null)
    } finally {
      setSending(false)
    }
  }

  const itemsTotal = items.reduce((acc, it) => acc + Number(it.total_price || 0), 0)
  const finalValue = order.final_price ?? order.estimated_price
  const checklist = [
    { label: "Tela", value: screenLabel(order.entry_checklist?.screen_condition), bad: !!order.entry_checklist?.screen_condition && order.entry_checklist.screen_condition !== "ok" },
    { label: "Liga", value: triLabel(order.entry_checklist?.turns_on), bad: order.entry_checklist?.turns_on === false },
    { label: "Touch", value: triLabel(order.entry_checklist?.touch_works, "Funciona", "Não funciona"), bad: order.entry_checklist?.touch_works === false },
    { label: "Câmeras", value: triLabel(order.entry_checklist?.cameras_work, "Funcionam", "Não funcionam"), bad: order.entry_checklist?.cameras_work === false },
    { label: "Botões", value: triLabel(order.entry_checklist?.buttons_work, "Funcionam", "Não funcionam"), bad: order.entry_checklist?.buttons_work === false },
    { label: "Carga", value: triLabel(order.entry_checklist?.charging_port_ok, "OK", "Com problema"), bad: order.entry_checklist?.charging_port_ok === false },
    { label: "Som", value: triLabel(order.entry_checklist?.speakers_ok, "OK", "Com problema"), bad: order.entry_checklist?.speakers_ok === false },
    { label: "Microfone", value: triLabel(order.entry_checklist?.microphone_ok, "OK", "Com problema"), bad: order.entry_checklist?.microphone_ok === false },
  ]

  return (
    <Card>
      <CardHeader className="grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="grid gap-2">
          <p className="sc-label text-sc-stone">Para o cliente</p>
          <CardTitle>Nota de serviço</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport} disabled={exporting} variant="secondary">
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            Baixar imagem
          </Button>
          <Button onClick={handleSendWhatsApp} disabled={sending} className="bg-sc-green text-sc-ink">
            {sending ? <Loader2 className="animate-spin" /> : <MessageCircle />}
            Enviar pelo WhatsApp
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {whatsappUrl && (
          <div className="flex flex-wrap items-center gap-3 rounded-[18px] border border-sc-line bg-sc-raised px-4 py-3">
            <MessageCircle className="size-5 shrink-0 text-sc-green" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-sc-bone">A nota está pronta.</p>
              <p className="text-[13px] text-sc-stone">O WhatsApp não abriu sozinho: toque para abrir.</p>
            </div>
            <Button asChild size="sm" className="bg-sc-green text-sc-ink">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Abrir o WhatsApp
              </a>
            </Button>
          </div>
        )}

        {/* a prévia num celular, como o cliente vai ver; só a tela vira imagem */}
        <div ref={frameRef} className="pb-2">
          {/* a tela do aparelho mede o próprio conteúdo como contêiner, então o aparelho tem largura fixa;
              a margem negativa devolve a altura que o transform não tira do fluxo */}
          <div
            ref={deviceRef}
            className="sc-device mx-auto origin-top-left"
            style={{
              width: DEVICE_W,
              transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined,
              marginBottom: fit.scale < 1 ? -fit.height * (1 - fit.scale) : undefined,
            }}
          >
            <div className="sc-device__bezel">
              <div className="sc-device__screen">
                <div
                  ref={ref}
                  className="relative isolate overflow-hidden font-sans text-sc-bone"
                  style={{ width: IMG_W, height: IMG_H, backgroundColor: "#0a0908", WebkitPrintColorAdjust: "exact" }}
                >
                  {/* o halo vermelho da marca, atrás de tudo, no canto de cima */}
                  <div
                    className="pointer-events-none absolute -top-28 -right-24 size-[340px] rounded-full"
                    style={{ background: "radial-gradient(closest-side, rgba(255,2,0,0.42), transparent)" }}
                  />
                  <div className="relative z-[1] flex h-full flex-col">
                    {/* barra de status */}
                    <div className="flex shrink-0 items-end justify-between px-7 pb-1.5" style={{ height: SAFE_TOP }}>
                      <span className="text-[14px] font-semibold tabular-nums text-sc-bone">{time}</span>
                      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-sc-bone">
                        5G
                        <span className="relative rounded-[3px] border border-sc-bone/70" style={{ width: 22, height: 11 }}>
                          <span className="absolute inset-y-[1.5px] left-[1.5px] rounded-[1.5px] bg-sc-bone" style={{ width: 14 }} />
                        </span>
                      </span>
                    </div>

                    {/* cabeçalho: a marca e a OS */}
                    <div className="shrink-0 px-5 pt-3 pb-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 place-items-center rounded-[10px] bg-sc-red">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/home/glyph.png" alt="" className="h-[64%] w-auto" />
                        </span>
                        <span className="font-display text-[22px] leading-none font-black uppercase">
                          Saymon <span className="text-sc-red">Cell</span>
                        </span>
                        <span className="ml-auto font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-sc-stone">
                          {formatDate(order.created_at)}
                        </span>
                      </div>
                      <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-sc-stone">
                        Nota de serviço
                      </p>
                      <p className="mt-1.5 font-display text-[56px] leading-[0.84] font-black uppercase">
                        OS #{order.order_number}
                      </p>
                    </div>

                    {/* corpo */}
                    <div className="grid flex-1 content-start gap-3 overflow-hidden px-5 text-[12px] leading-[1.4]">
                      <div className="grid grid-cols-2 gap-3 border-t border-sc-line pt-3">
                        <NoteBlock label="Cliente">
                          <p className="font-semibold">{order.customer?.name}</p>
                          <p className="text-sc-stone">{order.customer?.phone}</p>
                        </NoteBlock>
                        <NoteBlock label="Aparelho">
                          <p className="font-semibold">
                            {order.device_brand} {order.device_model}
                          </p>
                          <p className="text-sc-stone">{[order.device_color, order.device_imei && `IMEI ${order.device_imei}`].filter(Boolean).join(" · ") || "—"}</p>
                        </NoteBlock>
                      </div>

                      <NoteBlock label="Defeito" className="border-t border-sc-line pt-3">
                        <p>{order.problem_description}</p>
                        {order.diagnosis && <p className="mt-1 text-sc-stone">Diagnóstico: {order.diagnosis}</p>}
                      </NoteBlock>

                      <NoteBlock label="Checklist de entrada" className="border-t border-sc-line pt-3">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          {checklist.map((row) => (
                            <NoteItem key={row.label} label={row.label} value={row.value} bad={row.bad} />
                          ))}
                        </div>
                        {order.entry_checklist?.physical_damage && (
                          <p className="mt-1.5 text-sc-stone">Danos: {order.entry_checklist.physical_damage}</p>
                        )}
                        {order.entry_checklist?.accessories_received && (
                          <p className="text-sc-stone">Acessórios: {order.entry_checklist.accessories_received}</p>
                        )}
                      </NoteBlock>

                      {items.length > 0 && (
                        <NoteBlock label="Peças e serviços" className="border-t border-sc-line pt-3">
                          <div className="grid gap-1">
                            {items.map((it) => (
                              <div key={it.id} className="flex justify-between gap-3">
                                <span className="truncate">
                                  {it.quantity}× {it.description}
                                </span>
                                <span className="tabular-nums">{formatCurrency(Number(it.total_price))}</span>
                              </div>
                            ))}
                            <div className="flex justify-between gap-3 text-sc-stone">
                              <span>Total dos itens</span>
                              <span className="tabular-nums">{formatCurrency(itemsTotal)}</span>
                            </div>
                          </div>
                        </NoteBlock>
                      )}
                    </div>

                    {/* o valor e o rodapé */}
                    <div className="shrink-0 px-5 pb-3">
                      <div className="flex items-end justify-between gap-3 rounded-[16px] bg-sc-red px-4 py-3 text-sc-ink">
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.06em]">
                          {order.final_price != null ? "Valor final" : "Valor estimado"}
                        </span>
                        <span className="font-display text-[34px] leading-[0.84] font-black tabular-nums">
                          {finalValue != null ? formatCurrency(finalValue) : "A definir"}
                        </span>
                      </div>
                      <p className="mt-2.5 text-[10px] leading-[1.4] text-sc-stone">
                        {order.delivery_type === "store" ? "Retirada na loja" : `Busca e entrega${order.delivery_address ? ` · ${order.delivery_address}` : ""}`}
                        {" · "}Recebido {formatDate(order.received_at)}
                        {order.completed_at ? ` · Concluído ${formatDate(order.completed_at)}` : ""}
                        {order.delivered_at ? ` · Entregue ${formatDate(order.delivered_at)}` : ""}
                      </p>
                      <p className="mt-1 text-[10px] leading-[1.4] text-sc-stone">
                        WhatsApp (37) 98802-3341 · Av. Anhanguera, 1286, Loja 02 · Jardim dos Candidés, Divinópolis - MG
                      </p>
                    </div>

                    {/* indicador da tela de início */}
                    <div className="flex shrink-0 items-center justify-center" style={{ height: SAFE_BOTTOM }}>
                      <div className="rounded-full bg-white/25" style={{ width: 134, height: 5 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function NoteBlock({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <p className="mb-1 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-sc-stone">{label}</p>
      {children}
    </div>
  )
}

function screenLabel(value?: "ok" | "cracked" | "broken" | null) {
  return value === "ok" ? "Sem dano" : value === "cracked" ? "Trincada" : value === "broken" ? "Quebrada" : "—"
}

function NoteItem({ label, value, bad = false }: { label: string; value: string; bad?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sc-stone">{label}</span>
      <span className={bad ? "font-semibold text-sc-red" : "font-medium"}>{value}</span>
    </div>
  )
}

function triLabel(v?: boolean | null, yes = "Sim", no = "Não") {
  if (v === true) return yes
  if (v === false) return no
  return "—"
}

function formatWhatsAppPhone(phone?: string | null) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  let p = digits
  if (p.startsWith("0")) p = p.slice(1)
  if (p.startsWith("55")) return p
  if (p.length >= 10 && p.length <= 13) return `55${p}`
  return p || null
}
 
