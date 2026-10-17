// Ilustrações dos serviços (lado esquerdo dos painéis). Formas simples nas
// cores da marca; o reparo em placa usa a foto real do panfleto. Trocar por fotos da bancada.

import { useId, useMemo, type CSSProperties } from "react"
import { makeCracks } from "./crack"
import "./visuals.css"

export type VisualKind = "tela" | "bateria" | "conector" | "banho" | "placa" | "software"

const CAPTIONS: Record<VisualKind, string> = {
  tela: "Fig. 01 · Vidro + display",
  bateria: "Fig. 02 · Li-ion 3,85 V",
  conector: "Fig. 03 · USB-C, 24 pinos",
  banho: "Fig. 04 · Resgate pós-água",
  placa: "Fig. 05 · Placa lógica",
  software: "Fig. 06 · Sistema",
}

export function ServiceVisual({ kind }: { kind: VisualKind }) {
  return (
    <div className={`sv sv--${kind}`}>
      {kind === "tela" && <ScreenArt />}
      {kind === "bateria" && <BatteryArt />}
      {kind === "conector" && <PortArt />}
      {kind === "banho" && <WaterArt />}
      {kind === "placa" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="sv__photo" src="/home/teardown.jpg" alt="Interior de um smartphone aberto" />
      )}
      {kind === "software" && <SoftwareArt />}
      <span className="sv__caption sc-label">{CAPTIONS[kind]}</span>
    </div>
  )
}

function ScreenArt() {
  const cracks = useMemo(() => makeCracks(7, 236, 430, 158, 250), [])
  return (
    <svg viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className="f-ink" width="400" height="540" />
      <rect className="f-carbon s-line" x="70" y="40" width="260" height="470" rx="40" />
      <g transform="translate(82 52)">
        <rect className="f-screen" width="236" height="446" rx="30" />
        <rect className="f-glint" x="-40" y="120" width="320" height="26" transform="rotate(-28 118 223)" />
        <g className="sv-crack">
          {cracks.map((c, i) => (
            <path key={i} d={c.d} pathLength={1} strokeWidth={c.w} />
          ))}
        </g>
        <circle className="f-bone" cx="158" cy="250" r="3.5" />
      </g>
      <rect className="f-ink" x="170" y="60" width="60" height="14" rx="7" />
    </svg>
  )
}

function BatteryArt() {
  return (
    <svg viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className="f-red" width="400" height="540" />
      <rect className="f-ink" x="160" y="70" width="80" height="26" rx="7" />
      <rect className="s-ink-12" x="104" y="92" width="192" height="360" rx="30" fill="none" />
      <g className="sv-cells">
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} className="f-ink sv-cell" x="126" y={378 - i * 68} width="148" height="54" rx="10" style={{ animationDelay: `${i * 0.28}s` }} />
        ))}
      </g>
      <path className="f-red" d="M214 168 L178 268 H204 L188 338 L232 226 H204 Z" />
    </svg>
  )
}

function PortArt() {
  return (
    <svg viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className="f-ink" width="400" height="540" />
      <rect className="f-carbon s-line" x="-20" y="150" width="440" height="190" rx="40" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={`l${i}`} className="f-ink" cx={22 + i * 13} cy="245" r="4" />
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <circle key={`r${i}`} className="f-ink" cx={313 + i * 13} cy="245" r="4" />
      ))}
      <rect className="s-bone-5" x="112" y="210" width="176" height="70" rx="35" fill="none" />
      <rect className="f-ink-raised" x="136" y="231" width="128" height="28" rx="6" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`t${i}`} className="f-red" x={142 + i * 10} y="234" width="5" height="8" rx="1" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={`b${i}`} className="f-red" x={142 + i * 10} y="248" width="5" height="8" rx="1" />
      ))}
      <g className="sv-plug">
        <rect className="f-bone" x="150" y="400" width="100" height="42" rx="21" />
        <rect className="f-bone" x="168" y="440" width="64" height="120" rx="14" />
      </g>
    </svg>
  )
}

function WaterArt() {
  const clip = `sv-water-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  return (
    <svg viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <path className="sv-wave" d="M-400 300 Q-350 280 -300 300 T-200 300 T-100 300 T0 300 T100 300 T200 300 T300 300 T400 300 T500 300 T600 300 T700 300 T800 300 V600 H-400 Z" />
        </clipPath>
      </defs>
      <rect className="f-bone" width="400" height="540" />
      <g transform="rotate(-14 200 270)">
        <rect className="s-ink-6" x="118" y="70" width="164" height="330" rx="30" fill="none" />
        <rect className="f-ink" x="178" y="86" width="44" height="10" rx="5" />
      </g>
      <g clipPath={`url(#${clip})`}>
        <rect className="f-ink" x="-10" y="250" width="420" height="300" />
        <g transform="rotate(-14 200 270)">
          <rect className="s-bone-6" x="118" y="70" width="164" height="330" rx="30" fill="none" />
        </g>
        {[60, 110, 170, 250, 300, 340].map((cx, i) => (
          <circle key={cx} className="f-bone sv-bubble" cx={cx} cy={520} r={4 + (i % 3) * 3} style={{ animationDelay: `${i * 0.55}s` }} />
        ))}
      </g>
    </svg>
  )
}

function SoftwareArt() {
  const r = 104
  const c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect className="f-ink" width="400" height="540" />
      <circle className="s-track" cx="200" cy="210" r={r} fill="none" />
      <circle className="s-progress sv-ring" cx="200" cy="210" r={r} fill="none" strokeDasharray={`${c} ${c}`} style={{ "--c": c } as CSSProperties} transform="rotate(-90 200 210)" />
      <text className="sv-ring-label" x="200" y="230" textAnchor="middle">
        OK
      </text>
      {["Backup", "Formatação", "Conta Google"].map((label, i) => (
        <g key={label} className="sv-log" transform={`translate(70 ${370 + i * 34})`}>
          <text className="sv-log-label">{label.toUpperCase()}</text>
          <line className="s-dots" x1={label.length * 8 + 14} y1="-4" x2="226" y2="-4" />
          <path className="s-ok" d="M246 -9 l5 5 l9 -10" fill="none" />
        </g>
      ))}
    </svg>
  )
}
