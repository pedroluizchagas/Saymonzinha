"use client"

import { useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ServiceOrder, ServiceOrderItem } from "@/types/database"
import { toPng } from "html-to-image"
import { Loader2, Download, MessageCircle, ExternalLink } from "lucide-react"
import Image from "next/image"
import { uploadServiceNoteImage } from "@/lib/actions/service-order-actions"

// Dimensoes da imagem exportada (simula tela de smartphone)
const IMG_W = 390
const IMG_H = 844

// Safe areas simuladas (compativel com iPhone 14/15 Pro)
const SAFE_TOP = 54 // barra de status (notch / dynamic island)
const SAFE_BOTTOM = 34 // home indicator

interface ServiceNoteProps {
  order: ServiceOrder
  items?: ServiceOrderItem[]
}

/** Retorna hora atual formatada para a barra de status simulada */
function currentTime(): string {
  const now = new Date()
  return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

export function ServiceNote({ order, items = [] }: ServiceNoteProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [exporting, setExporting] = useState(false)
  const [sending, setSending] = useState(false)
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null)

  const formatCurrency = (v: number | null | undefined) => {
    if (v == null) return "-"
    return `R$ ${v.toFixed(2)}`
  }

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-"
    try {
      return new Date(iso).toLocaleDateString("pt-BR")
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
        backgroundColor: "#0a0a0b",
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
      backgroundColor: "#0a0a0b",
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

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground">Nota de Servico (Preview Mobile)</p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-primary text-primary-foreground"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Exportar imagem
          </Button>
          <Button
            onClick={handleSendWhatsApp}
            disabled={sending}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4 mr-2" />
            )}
            Enviar WhatsApp
          </Button>
        </div>
      </div>

      {whatsappUrl && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-4 py-3">
          <MessageCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground font-medium">
              Nota gerada com sucesso!
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clique no botao abaixo para abrir o WhatsApp.
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir WhatsApp
          </a>
        </div>
      )}
 
      <div className="w-full overflow-x-auto">
        <div className="inline-block">
          <Card className="bg-card border-border mx-auto w-[390px]">
            <CardContent className="p-0">
              {/* --- Container capturado como imagem --- */}
              <div
                ref={ref}
                className="text-neutral-100 font-sans overflow-hidden"
                style={{
                  width: IMG_W,
                  height: IMG_H,
                  backgroundColor: "#0a0a0b",
                  WebkitPrintColorAdjust: "exact",
                }}
              >
                <div className="h-full flex flex-col">

                  {/* ======= SAFE AREA TOPO - Barra de status simulada ======= */}
                  <div
                    className="shrink-0 flex items-end justify-between px-6 pb-1"
                    style={{ height: SAFE_TOP, backgroundColor: "#0a0a0b" }}
                  >
                    <span className="text-[13px] font-semibold text-white/90">
                      {currentTime()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {/* Sinal celular - 4 barras */}
                      <div className="flex items-end gap-[2px]">
                        <div className="w-[3px] h-[5px] rounded-sm bg-white/80" />
                        <div className="w-[3px] h-[7px] rounded-sm bg-white/80" />
                        <div className="w-[3px] h-[9px] rounded-sm bg-white/80" />
                        <div className="w-[3px] h-[11px] rounded-sm bg-white/80" />
                      </div>
                      {/* Wi-Fi - arcos simplificados */}
                      <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
                        <path d="M7.5 10.5a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" fill="rgba(255,255,255,0.85)" />
                        <path d="M4.5 9a4.2 4.2 0 016 0" stroke="rgba(255,255,255,0.85)" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M2.2 6.5a7.5 7.5 0 0110.6 0" stroke="rgba(255,255,255,0.85)" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M0 4a11 11 0 0115 0" stroke="rgba(255,255,255,0.85)" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      {/* Bateria */}
                      <div className="flex items-center">
                        <div
                          className="relative rounded-[3px] border border-white/70"
                          style={{ width: 22, height: 11 }}
                        >
                          <div
                            className="absolute left-[1.5px] top-[1.5px] bottom-[1.5px] rounded-[1.5px]"
                            style={{ width: 14, backgroundColor: "#4ade80" }}
                          />
                        </div>
                        <div
                          className="rounded-r-sm bg-white/70"
                          style={{ width: 2, height: 5, marginLeft: 1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ======= CABECALHO - Logo e info da OS ======= */}
                  <div className="px-4 py-3 border-b border-neutral-700/60">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/images/chatgpt-20image-2023-20de-20jun.png"
                        alt="Saymon Cell"
                        width={120}
                        height={42}
                        className="w-auto h-10"
                      />
                      <div>
                        <p className="text-sm font-semibold">Saymon Cell - Assistencia Tecnica</p>
                        <p className="text-[11px] text-gray-300">OS #{order.order_number} -- {formatDate(order.created_at)}</p>
                      </div>
                    </div>
                  </div>

                  {/* ======= CONTEUDO PRINCIPAL ======= */}
                  <div className="flex-1 overflow-hidden px-4 py-2.5 grid grid-cols-1 gap-1.5">
                    <div className="text-[12px]">
                      <p className="font-semibold text-white">Cliente</p>
                      <p>{order.customer?.name}</p>
                      <p className="text-gray-300">{order.customer?.phone}</p>
                      {order.customer?.email && <p className="text-gray-300">{order.customer.email}</p>}
                    </div>

                    <div className="text-[12px]">
                      <p className="font-semibold text-white">Aparelho</p>
                      <p>
                        {order.device_brand} {order.device_model}
                      </p>
                      <p className="text-gray-300">
                        Cor: {order.device_color || "-"} -- IMEI: {order.device_imei || "-"}
                      </p>
                    </div>

                    <div className="text-[12px]">
                      <p className="font-semibold text-white">Problema</p>
                      <p>{order.problem_description}</p>
                      {order.problem_type?.name && <p className="text-gray-300">Tipo: {order.problem_type.name}</p>}
                    </div>

                    {order.diagnosis && (
                      <div className="text-[12px]">
                        <p className="font-semibold text-white">Diagnostico</p>
                        <p>{order.diagnosis}</p>
                      </div>
                    )}

                    {items.length > 0 && (
                      <div className="text-[12px]">
                        <p className="font-semibold text-white">Itens</p>
                        <div className="mt-1 border border-neutral-700 rounded-md overflow-hidden">
                          <div className="grid grid-cols-3 px-2 py-1 text-gray-300">
                            <span>Descricao</span>
                            <span className="text-center">Qtde</span>
                            <span className="text-right">Total</span>
                          </div>
                          {items.map((it) => (
                            <div key={it.id} className="grid grid-cols-3 px-2 py-1 border-t border-neutral-700">
                              <span className="truncate">{it.description}</span>
                              <span className="text-center">{it.quantity}</span>
                              <span className="text-right">R$ {Number(it.total_price).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="grid grid-cols-3 px-2 py-1 border-t border-neutral-700 font-semibold">
                            <span>Total</span>
                            <span />
                            <span className="text-right">
                              R$ {items.reduce((acc, it) => acc + Number(it.total_price || 0), 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="text-[12px] grid grid-cols-2 gap-2">
                      <div>
                        <p className="font-semibold text-white">Estimado</p>
                        <p>{formatCurrency(order.estimated_price)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-white">Final</p>
                        <p>{formatCurrency(order.final_price)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold text-white">Custo de Pecas</p>
                        <p>{formatCurrency(order.parts_cost)}</p>
                      </div>
                    </div>

                    <div className="text-[12px]">
                      <p className="font-semibold text-white">Checklist</p>
                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                        <NoteItem label="Liga" value={triLabel(order.entry_checklist?.turns_on)} />
                        <NoteItem label="Touch" value={triLabel(order.entry_checklist?.touch_works, "Funciona", "Nao funciona")} />
                        <NoteItem label="Cameras" value={triLabel(order.entry_checklist?.cameras_work, "Funcionam", "Nao funcionam")} />
                        <NoteItem label="Botoes" value={triLabel(order.entry_checklist?.buttons_work, "Funcionam", "Nao funcionam")} />
                        <NoteItem label="Carga" value={triLabel(order.entry_checklist?.charging_port_ok, "OK", "Com problema")} />
                        <NoteItem label="Som" value={triLabel(order.entry_checklist?.speakers_ok, "OK", "Com problema")} />
                        <NoteItem label="Microfone" value={triLabel(order.entry_checklist?.microphone_ok, "OK", "Com problema")} />
                        <NoteItem
                          label="Tela"
                          value={
                            order.entry_checklist?.screen_condition === "ok"
                              ? "Sem dano"
                              : order.entry_checklist?.screen_condition === "cracked"
                              ? "Trincada"
                              : order.entry_checklist?.screen_condition === "broken"
                              ? "Quebrada"
                              : "-"
                          }
                        />
                      </div>
                      {order.entry_checklist?.physical_damage && (
                        <div className="mt-1.5">
                          <p className="font-semibold text-white">Danos fisicos</p>
                          <p className="text-gray-300">{order.entry_checklist?.physical_damage}</p>
                        </div>
                      )}
                      {order.entry_checklist?.accessories_received && (
                        <div className="mt-1.5">
                          <p className="font-semibold text-white">Acessorios recebidos</p>
                          <p className="text-gray-300">{order.entry_checklist?.accessories_received}</p>
                        </div>
                      )}
                      {order.entry_checklist?.notes && (
                        <div className="mt-1.5">
                          <p className="font-semibold text-white">Observacoes</p>
                          <p className="text-gray-300">{order.entry_checklist?.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ======= RODAPE ======= */}
                  <div className="shrink-0 px-4 py-2.5 bg-neutral-800/80 border-t border-neutral-700/60">
                    <p className="text-[10px] text-gray-300">
                      Entrega: {order.delivery_type === "store" ? "Na Loja" : "Entrega"} -- {order.delivery_address || "-"}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      Datas -- Recebido: {formatDate(order.received_at)} -- Concluido: {formatDate(order.completed_at)} --
                      Entregue: {formatDate(order.delivered_at)}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      Saymon Cell -- Atendimento: (37) 99922-0892 -- Endereco: Av. Anhanguera, 1286, Loja 02 -- Jardim dos
                      Candides, Divinopolis - MG
                    </p>
                  </div>

                  {/* ======= SAFE AREA RODAPE - Home indicator simulado ======= */}
                  <div
                    className="shrink-0 flex items-center justify-center"
                    style={{ height: SAFE_BOTTOM, backgroundColor: "#0a0a0b" }}
                  >
                    <div
                      className="rounded-full bg-white/20"
                      style={{ width: 134, height: 5 }}
                    />
                  </div>

                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
     </div>
   )
 }
 
 function NoteItem({ label, value }: { label: string; value: string }) {
   return (
     <div className="flex items-center justify-between">
      <span className="text-gray-300">{label}</span>
       <span className="font-medium">{value}</span>
     </div>
   )
 }
 
 function triLabel(v?: boolean | null, yes = "Sim", no = "Não") {
   if (v === true) return yes
   if (v === false) return no
   return "-"
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
 
