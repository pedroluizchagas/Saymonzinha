"use client"

// Aviso da loja virtual no estilo da tela de bloqueio ("Adicionado ao carrinho", produtos que saíram
// da loja virtual): desce logo abaixo do cabeçalho, com a foto do produto no lugar do ícone do app, e
// some sozinho. "Ver carrinho" abre o carrinho. A região anuncia cada aviso para quem usa leitor de tela.

import { Check, Info } from "lucide-react"
import { useEffect, useState } from "react"

const VISIBLE_MS = 3200

export type StoreNotice = { title: string; detail: string; tone: "done" | "info"; image?: string | null }

export function StoreNotification({
  notice,
  signal,
  onOpenCart,
}: {
  notice: StoreNotice | null
  signal: number
  onOpenCart: () => void
}) {
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
          <span className="sc-notif__icon lv-notif__icon" data-photo={notice.image ? "1" : undefined}>
            {notice.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={notice.image} alt="" />
            ) : notice.tone === "done" ? (
              <Check aria-hidden="true" />
            ) : (
              <Info aria-hidden="true" />
            )}
          </span>
          <span>
            <span className="sc-notif__title">{notice.title}</span>
            <span className="sc-notif__meta">{notice.detail}</span>
          </span>
          {notice.tone === "done" ? (
            <button
              type="button"
              className="sc-pill sc-pill--ink sc-pill--sm lv-notif__open"
              tabIndex={on ? 0 : -1}
              onClick={() => {
                setOn(false)
                onOpenCart()
              }}
            >
              Ver carrinho
            </button>
          ) : (
            <span className="sc-notif__time" aria-hidden="true">
              agora
            </span>
          )}
        </div>
      )}
    </div>
  )
}
