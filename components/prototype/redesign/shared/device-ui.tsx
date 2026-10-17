"use client"

// PROTÓTIPO: peças de interface do aparelho usadas pelas variantes (barra de status,
// relógio ao vivo, deslize para atender). Estilos em ../sc-system.css.

import { Phone } from "lucide-react"
import { useEffect, useRef, useState, type CSSProperties } from "react"

const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "America/Sao_Paulo",
})

/** Hora de Divinópolis. Começa em 09:41 (hora clássica de vitrine) para o SSR bater com o cliente. */
export function useClock() {
  const [time, setTime] = useState("09:41")
  useEffect(() => {
    const tick = () => setTime(TIME_FORMAT.format(new Date()))
    tick()
    const id = window.setInterval(tick, 15_000)
    return () => window.clearInterval(id)
  }, [])
  return time
}

export function StatusBar({ time, level = 72, style }: { time: string; level?: number; style?: CSSProperties }) {
  return (
    <div className="sc-statusbar" style={style} aria-hidden="true">
      <span>{time}</span>
      <span className="sc-statusbar__right">
        5G
        <span className="sc-battery" style={{ "--level": `${level}%` } as CSSProperties}>
          <i />
        </span>
      </span>
    </div>
  )
}

/** Deslize para atender: arrastar o botão verde até o fim abre o link. */
export function CallSlider({ href, label = "deslize para atender" }: { href: string; label?: string }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [x, setX] = useState(0)
  const drag = useRef<{ start: number; max: number } | null>(null)
  const moved = useRef(false)

  const open = () => {
    window.open(href, "_blank", "noopener,noreferrer")
    window.setTimeout(() => setX(0), 600)
  }

  return (
    <div className="sc-slider" ref={trackRef}>
      <span className="sc-slider__label">{label}</span>
      <button
        type="button"
        className="sc-slider__knob"
        aria-label="Atender: abrir conversa no WhatsApp"
        style={{ "--x": `${x}px`, transition: drag.current ? "none" : "transform .45s var(--ease-out)" } as CSSProperties}
        onClick={() => {
          if (!moved.current) open()
        }}
        onPointerDown={(e) => {
          const track = trackRef.current
          if (!track) return
          e.currentTarget.setPointerCapture(e.pointerId)
          moved.current = false
          drag.current = { start: e.clientX - x, max: track.clientWidth - 60 }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          const next = Math.max(0, Math.min(drag.current.max, e.clientX - drag.current.start))
          if (Math.abs(next - x) > 3) moved.current = true
          setX(next)
        }}
        onPointerUp={() => {
          const d = drag.current
          drag.current = null
          if (d && x > d.max * 0.82) {
            setX(d.max)
            open()
          } else setX(0)
        }}
      >
        <Phone strokeWidth={2.2} />
      </button>
    </div>
  )
}
