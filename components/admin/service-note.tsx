 "use client"
 
 import { useRef, useState } from "react"
 import { Card, CardContent } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
import type { ServiceOrder, ServiceOrderItem } from "@/types/database"
import { toPng } from "html-to-image"
import { Loader2, Download, MessageCircle } from "lucide-react"
 import Image from "next/image"
import { uploadServiceNoteImage } from "@/lib/actions/service-order-actions"
 
interface ServiceNoteProps {
  order: ServiceOrder
  items?: ServiceOrderItem[]
}
 
export function ServiceNote({ order, items = [] }: ServiceNoteProps) {
   const ref = useRef<HTMLDivElement | null>(null)
   const [exporting, setExporting] = useState(false)
   const [sending, setSending] = useState(false)
 
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
         width: 390,
         height: 844,
         pixelRatio: 2,
         cacheBust: true,
        backgroundColor: "#0f1115",
       })
 
       const link = document.createElement("a")
       link.download = `nota-os-${order.order_number}.png`
       link.href = dataUrl
       link.click()
     } finally {
       setExporting(false)
     }
   }

   const handleSendWhatsApp = async () => {
     if (!ref.current) return
     setSending(true)
     try {
      const preOpened = window.open("", "_blank")
       const dataUrl = await toPng(ref.current, {
         width: 390,
         height: 844,
         pixelRatio: 2,
         cacheBust: true,
         backgroundColor: "#0f1115",
       })
       const upload = await uploadServiceNoteImage(order.order_number, dataUrl)
       const url = upload.url || ""
       const msg = `Olá! Segue a Nota de Serviço da OS #${order.order_number}:\n${url}`
       const phone = formatWhatsAppPhone(order.customer?.phone || "")
       const wa = phone
         ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
         : `https://wa.me/?text=${encodeURIComponent(msg)}`
      if (preOpened) {
        preOpened.location.href = wa
      } else {
        window.location.href = wa
      }
     } finally {
       setSending(false)
     }
   }
 
   return (
     <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Nota de Serviço (Preview Mobile)</p>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} disabled={exporting} className="bg-primary text-primary-foreground">
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Exportar imagem (390x844)
          </Button>
          <Button onClick={handleSendWhatsApp} disabled={sending} className="bg-emerald-600 text-white">
            {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageCircle className="w-4 h-4 mr-2" />}
            Enviar WhatsApp
          </Button>
        </div>
      </div>
 
      <div className="w-full overflow-x-auto">
        <div className="inline-block">
          <Card className="bg-card border-border mx-auto w-[390px]">
            <CardContent className="p-0">
              <div
                ref={ref}
                className="w-[390px] h-[844px] bg-neutral-900 text-neutral-100 font-sans overflow-hidden"
                style={{ WebkitPrintColorAdjust: "exact" }}
              >
                <div className="h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-neutral-700">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/images/chatgpt-20image-2023-20de-20jun.png"
                        alt="Saymon Cell"
                        width={120}
                        height={42}
                        className="w-auto h-10"
                      />
                      <div>
                        <p className="text-sm font-semibold">Saymon Cell - Assistência Técnica</p>
                        <p className="text-[11px] text-gray-300">OS #{order.order_number} · {formatDate(order.created_at)}</p>
                      </div>
                    </div>
                  </div>
 
                  <div className="px-4 py-3 grid grid-cols-1 gap-2">
                    <div className="text-[12px]">
                      <p className="font-semibold">Cliente</p>
                      <p>{order.customer?.name}</p>
                      <p className="text-gray-300">{order.customer?.phone}</p>
                      {order.customer?.email && <p className="text-gray-300">{order.customer.email}</p>}
                    </div>
 
                    <div className="text-[12px]">
                      <p className="font-semibold">Aparelho</p>
                      <p>
                        {order.device_brand} {order.device_model}
                      </p>
                      <p className="text-gray-300">
                        Cor: {order.device_color || "-"} · IMEI: {order.device_imei || "-"}
                      </p>
                    </div>
 
                    <div className="text-[12px]">
                      <p className="font-semibold">Problema</p>
                      <p>{order.problem_description}</p>
                      {order.problem_type?.name && <p className="text-gray-300">Tipo: {order.problem_type.name}</p>}
                    </div>
 
                    {order.diagnosis && (
                      <div className="text-[12px]">
                        <p className="font-semibold">Diagnóstico</p>
                        <p>{order.diagnosis}</p>
                      </div>
                    )}
 
                    {items.length > 0 && (
                      <div className="text-[12px]">
                        <p className="font-semibold">Itens</p>
                        <div className="mt-1 border border-neutral-700 rounded-md overflow-hidden">
                          <div className="grid grid-cols-3 px-2 py-1 text-gray-300">
                            <span>Descrição</span>
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
                        <p className="font-semibold">Estimado</p>
                        <p>{formatCurrency(order.estimated_price)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Final</p>
                        <p>{formatCurrency(order.final_price)}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="font-semibold">Custo de Peças</p>
                        <p>{formatCurrency(order.parts_cost)}</p>
                      </div>
                    </div>
 
                    <div className="text-[12px]">
                      <p className="font-semibold">Checklist</p>
                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                        <NoteItem label="Liga" value={triLabel(order.entry_checklist?.turns_on)} />
                        <NoteItem label="Touch" value={triLabel(order.entry_checklist?.touch_works, "Funciona", "Não funciona")} />
                        <NoteItem label="Câmeras" value={triLabel(order.entry_checklist?.cameras_work, "Funcionam", "Não funcionam")} />
                        <NoteItem label="Botões" value={triLabel(order.entry_checklist?.buttons_work, "Funcionam", "Não funcionam")} />
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
                        <div className="mt-2">
                          <p className="font-semibold">Danos físicos</p>
                          <p className="text-gray-300">{order.entry_checklist?.physical_damage}</p>
                        </div>
                      )}
                      {order.entry_checklist?.accessories_received && (
                        <div className="mt-2">
                          <p className="font-semibold">Acessórios recebidos</p>
                          <p className="text-gray-300">{order.entry_checklist?.accessories_received}</p>
                        </div>
                      )}
                      {order.entry_checklist?.notes && (
                        <div className="mt-2">
                          <p className="font-semibold">Observações</p>
                          <p className="text-gray-300">{order.entry_checklist?.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
 
                  <div className="mt-auto px-4 py-3 bg-neutral-800 border-t border-neutral-700">
                    <p className="text-[10px] text-gray-300">
                      Entrega: {order.delivery_type === "store" ? "Na Loja" : "Entrega"} · {order.delivery_address || "-"}
                    </p>
                    <p className="text-[10px] text-gray-300">
                      Datas · Recebido: {formatDate(order.received_at)} · Concluído: {formatDate(order.completed_at)} ·
                      Entregue: {formatDate(order.delivered_at)}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1">
                      Saymon Cell · Atendimento: (37) 99922-0892 · Endereço: Av. Anhanguera, 1286, Loja 02 — Jardim dos
                      Candidés, Divinópolis - MG
                    </p>
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
 
