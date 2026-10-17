"use client"

// Aviso da loja virtual no estilo da tela de bloqueio ("Adicionado ao carrinho", produtos que saíram
// da loja virtual): desce do topo e some sozinho. A região anuncia cada aviso para quem usa leitor de tela.

import { Check, Info } from "lucide-react"
import { useEffect, useState } from "react"

const VISIBLE_MS = 2600

export type StoreNotice = { title: string; detail: string; tone: "done" | "info" }

export function StoreNotification({ notice, signal }: { notice: StoreNotice | null; signal: number }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!signal) return
    setOn(true)
    const timer = window.setTimeout(() => setOn(false), VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [signal])

  return (
    <div className="lv-notif" data-on={on ? "1" : "0"} role="status" aria-live="polite">
      {notice && (
        // A chave muda a cada aviso, para ele ser lido de novo.
        <div className="sc-notif" key={signal}>
          <span className="sc-notif__icon">{notice.tone === "done" ? <Check aria-hidden="true" /> : <Info aria-hidden="true" />}</span>
          <span>
            <span className="sc-notif__title">{notice.title}</span>
            <span className="sc-notif__meta">{notice.detail}</span>
          </span>
          <span className="sc-notif__time" aria-hidden="true">
            agora
          </span>
        </div>
      )}
    </div>
  )
}
