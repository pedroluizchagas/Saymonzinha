"use client"

// "Adicionado ao carrinho" no estilo da tela de bloqueio: desce do topo e some sozinho. A região
// anuncia cada produto adicionado para quem usa leitor de tela.

import { Check } from "lucide-react"
import { useEffect, useState } from "react"

const VISIBLE_MS = 2600

export function AddedNotification({ name, signal }: { name: string; signal: number }) {
  const [on, setOn] = useState(false)

  useEffect(() => {
    if (!signal) return
    setOn(true)
    const timer = window.setTimeout(() => setOn(false), VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [signal])

  return (
    <div className="lv-notif" data-on={on ? "1" : "0"} role="status" aria-live="polite">
      {signal > 0 && (
        // A chave muda a cada produto adicionado, para o aviso ser lido de novo.
        <div className="sc-notif" key={signal}>
          <span className="sc-notif__icon">
            <Check aria-hidden="true" />
          </span>
          <span>
            <span className="sc-notif__title">Adicionado ao carrinho</span>
            <span className="sc-notif__meta">{name}</span>
          </span>
          <span className="sc-notif__time" aria-hidden="true">
            agora
          </span>
        </div>
      )}
    </div>
  )
}
