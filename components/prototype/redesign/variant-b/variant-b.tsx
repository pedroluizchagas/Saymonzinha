"use client"

// PROTÓTIPO — Variante B "Raio-X": o conteúdo fica fora do aparelho.
// O celular é a peça explicada: o scroll o desmonta em camadas (vista isométrica),
// cada camada apresenta um serviço, e ele se remonta "novo de novo".
// Depois a página segue editorial: etapas, números, marcas, loja e contato.

import { ArrowDown, ArrowUpRight, Check, Instagram, MapPin, Package, Phone } from "lucide-react"
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import type { Product } from "@/types/database"
import {
  ADDRESS,
  BRANDS,
  GUARANTEES,
  HOURS,
  INSTAGRAM_URL,
  MAPS_URL,
  SERVICES,
  STATS,
  STEPS,
  STORE_CATEGORIES,
  WHATSAPP_DISPLAY,
  serviceWhatsapp,
  whatsappLink,
  type Service,
} from "../shared/content"
import { makeCracks } from "../shared/crack"
import { CallSlider, useClock } from "../shared/device-ui"
import "./variant-b.css"

type LayerKey = "vidro" | "display" | "bateria" | "placa" | "chassi" | "tampa"

const LAYERS: { key: LayerKey; part: string; service: string }[] = [
  { key: "vidro", part: "Vidro", service: "tela" },
  { key: "display", part: "Display", service: "software" },
  { key: "bateria", part: "Bateria", service: "bateria" },
  { key: "placa", part: "Placa lógica", service: "placa" },
  { key: "chassi", part: "Chassi e conector", service: "conector" },
  { key: "tampa", part: "Tampa traseira", service: "banho" },
]

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// linha do tempo da cena, em alturas de tela
const T = { hero: 0.55, explode: 1.0, layer: 0.85, collapse: 1.0, hold: 0.5 }
const SCENE_VH = T.hero + T.explode + LAYERS.length * T.layer + T.collapse + T.hold

export function VariantB({ products }: { products: Product[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(-1)
  const [phase, setPhase] = useState<"hero" | "layers" | "done">("hero")
  const time = useClock()

  useEffect(() => {
    const root = rootRef.current
    const scene = sceneRef.current
    if (!root || !scene) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let raf = 0
    let last = { active: -2, phase: "" }
    const update = () => {
      raf = 0
      const vh = window.innerHeight
      const y = window.scrollY - scene.offsetTop
      const u = y / vh // progresso em alturas de tela
      const t1 = T.hero
      const t2 = t1 + T.explode
      const t3 = t2 + LAYERS.length * T.layer
      const t4 = t3 + T.collapse
      let open = 0
      if (u > t1 && u <= t2) open = ease(clamp((u - t1) / T.explode))
      else if (u > t2 && u <= t3) open = 1
      else if (u > t3) open = 1 - ease(clamp((u - t3) / T.collapse))
      const heal = clamp((u - t3) / T.collapse)
      const idx = u > t2 && u <= t3 ? Math.min(LAYERS.length - 1, Math.floor((u - t2) / T.layer)) : -1
      const ph = u <= t2 - T.explode * 0.5 ? "hero" : u <= t3 + T.collapse * 0.5 ? "layers" : "done"

      root.dataset.scrolled = u > SCENE_VH + 0.2 ? "1" : "0"
      const s = root.style
      s.setProperty("--open", (reduced ? 1 : open).toFixed(4))
      s.setProperty("--heal", heal.toFixed(4))
      s.setProperty("--intro", clamp(u / (t1 + T.explode * 0.6)).toFixed(4))
      if (idx !== last.active) {
        last.active = idx
        setActive(idx)
      }
      if (ph !== last.phase) {
        last.phase = ph
        setPhase(ph as typeof phase)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const services = useMemo(() => LAYERS.map((l) => SERVICES.find((s) => s.key === l.service) as Service), [])

  return (
    <div ref={rootRef} className="sc vb" data-phase={phase}>
      <header className="vb-header">
        <a className="sc-logo" href="/prototipo/b" aria-label="Saymon Cell, início">
          Saymon <b>Cell</b>
          <sup>®</sup>
        </a>
        <span className="sc-label vb-header__mid">Assistência técnica · Divinópolis, MG</span>
        <a className="sc-pill sc-pill--red sc-pill--sm" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          Pedir orçamento <ArrowUpRight />
        </a>
      </header>

      {/* ---------- a cena: abrir, explicar, remontar ---------- */}
      <div className="vb-scene" ref={sceneRef} style={{ height: `${(SCENE_VH + 1) * 100}svh` }}>
        <div className="vb-sticky">
          <div className="vb-grid" aria-hidden="true" />

          <div className="vb-hero">
            <p className="sc-label vb-hero__label">Busca · conserto · entrega</p>
            <h1 className="sc-display vb-hero__title">
              <span>Abrimos.</span>
              <span>Consertamos.</span>
              <span className="vb-red">Devolvemos.</span>
            </h1>
            <p className="sc-body vb-hero__lead">
              A Saymon Cell busca seu smartphone em casa, conserta no laboratório e devolve funcionando. Sem você sair de
              Divinópolis, nem do sofá.
            </p>
            <div className="vb-hero__actions">
              <a className="sc-pill sc-pill--red" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
                Pedir orçamento <ArrowUpRight />
              </a>
              <span className="sc-label vb-hero__cue">
                Role para abrir o aparelho <ArrowDown />
              </span>
            </div>
          </div>

          <p className="sc-display vb-finale" aria-hidden={phase !== "done"}>
            Novo
            <br />
            de novo<span className="vb-red">.</span>
          </p>

          <div className="vb-device" aria-hidden="true">
            <div className="vb-stack" data-active={active}>
              {LAYERS.map((layer, i) => (
                <div
                  key={layer.key}
                  className={`vb-layer vb-layer--${layer.key}`}
                  data-on={active === i ? "1" : "0"}
                  style={{ "--i": i } as CSSProperties}
                >
                  <LayerArt kind={layer.key} time={time} />
                  <span className="vb-layer__tag sc-label">
                    {String(i + 1).padStart(2, "0")} · {layer.part}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="vb-panel" aria-live="polite">
            {services.map((service, i) => (
              <article key={service.key} className="vb-card" data-on={active === i ? "1" : "0"} aria-hidden={active !== i}>
                <p className="sc-label vb-card__meta">
                  Camada {String(i + 1).padStart(2, "0")}/{String(LAYERS.length).padStart(2, "0")} · {LAYERS[i].part}
                </p>
                <span className="sc-display vb-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="sc-display vb-card__title">{service.title}</h2>
                <p className="sc-body vb-card__desc">{service.description}</p>
                <a
                  className="sc-pill sc-pill--red"
                  href={serviceWhatsapp(service)}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={active === i ? 0 : -1}
                >
                  Orçar no WhatsApp <ArrowUpRight />
                </a>
              </article>
            ))}
            <ol className="vb-dots" aria-hidden="true">
              {LAYERS.map((l, i) => (
                <li key={l.key} data-on={active === i ? "1" : active > i ? "past" : "0"} />
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ---------- página editorial ---------- */}
      <section className="vb-section vb-steps" id="etapas">
        <div className="vb-section__head">
          <p className="sc-label vb-muted">Como funciona</p>
          <h2 className="sc-display vb-h2">Do defeito à solução em 4 passos</h2>
        </div>
        <ol className="vb-timeline">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <span className="sc-label vb-red-text">Passo {String(i + 1).padStart(2, "0")}</span>
              <h3 className="sc-display vb-h3">{step.title}</h3>
              <p className="sc-body vb-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="vb-band" aria-label="Números">
        {STATS.map((s) => (
          <div className="vb-band__item" key={s.label}>
            <span className="sc-display vb-band__value">{s.value}</span>
            <span className="sc-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="vb-marquee" aria-label="Marcas que atendemos">
        <p className="sc-label vb-muted vb-marquee__label">Marcas que atendemos</p>
        <div className="vb-marquee__track">
          {[0, 1].map((copy) => (
            <div className="vb-marquee__row" key={copy} aria-hidden={copy === 1}>
              {BRANDS.map((b) => (
                <span className="sc-display vb-marquee__word" key={b}>
                  {b}
                  <i aria-hidden="true">✶</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="vb-section vb-why">
        <div className="vb-section__head">
          <p className="sc-label vb-muted">Por que a Saymon Cell</p>
          <h2 className="sc-display vb-h2">10 anos cuidando do que conecta você</h2>
        </div>
        <ul className="vb-why__grid">
          {GUARANTEES.map((g, i) => (
            <li key={g.title}>
              <span className="sc-label vb-muted">{String(i + 1).padStart(2, "0")}</span>
              <Check aria-hidden="true" />
              <h3 className="sc-display vb-h3">{g.title}</h3>
              <p className="sc-body vb-muted">{g.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="vb-section vb-store">
        <div className="vb-section__head vb-section__head--row">
          <div>
            <p className="sc-label">Loja</p>
            <h2 className="sc-display vb-h2">Acessórios</h2>
          </div>
          <a className="sc-pill sc-pill--ink" href="/loja">
            Ver a loja <ArrowUpRight />
          </a>
        </div>
        {products.length > 0 ? (
          <div className="vb-products">
            {products.map((p) => (
              <a className="vb-product" href="/loja" key={p.id}>
                <span className="vb-product__img">
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" />
                  ) : (
                    <Package aria-hidden="true" />
                  )}
                </span>
                <span className="sc-ui">{p.name}</span>
                <span className="sc-label">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.sale_price)}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <ul className="vb-categories">
            {STORE_CATEGORIES.map((c, i) => (
              <li key={c}>
                <span className="sc-label">{String(i + 1).padStart(2, "0")}</span>
                <span className="sc-display vb-h3">{c}</span>
                <ArrowUpRight aria-hidden="true" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="vb-section vb-visit">
        <div className="vb-visit__main">
          <p className="sc-label vb-muted">Onde estamos</p>
          <h2 className="sc-display vb-visit__street">{ADDRESS.street}</h2>
          <p className="sc-body">
            {ADDRESS.unit} · {ADDRESS.district} · {ADDRESS.city} · CEP {ADDRESS.zip}
          </p>
          <div className="vb-visit__actions">
            <a className="sc-pill sc-pill--white" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
              <MapPin /> Abrir no Maps
            </a>
            <a className="sc-pill sc-pill--ghost" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Instagram /> @saymoncell037
            </a>
          </div>
        </div>
        <dl className="vb-visit__hours">
          {HOURS.map((h) => (
            <div key={h.days}>
              <dt className="sc-label vb-muted">{h.days}</dt>
              <dd className="sc-display vb-h3">{h.time}</dd>
            </div>
          ))}
          <div>
            <dt className="sc-label vb-muted">WhatsApp</dt>
            <dd className="sc-display vb-h3">{WHATSAPP_DISPLAY}</dd>
          </div>
        </dl>
      </section>

      <footer className="vb-footer">
        <div className="vb-call" role="group" aria-label="Chamada recebida da Saymon Cell">
          <span className="vb-call__avatar" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/prototype/redesign/glyph.png" alt="" />
          </span>
          <div className="vb-call__text">
            <p className="sc-ui">Saymon Cell</p>
            <p className="sc-label vb-muted">
              <Phone aria-hidden="true" /> Chamada recebida · sobre o seu conserto
            </p>
          </div>
          <div className="vb-call__slider">
            <CallSlider href={whatsappLink("Olá Saymon Cell! Vim pelo site e quero consertar meu celular.")} />
          </div>
        </div>
        <p className="sc-label vb-muted vb-footer__legal">© {new Date().getFullYear()} Saymon Cell · Assistência técnica</p>
      </footer>
    </div>
  )
}

function LayerArt({ kind, time }: { kind: LayerKey; time: string }) {
  const cracks = useMemo(() => (kind === "vidro" ? makeCracks(11, 240, 500, 168, 300) : []), [kind])
  switch (kind) {
    case "vidro":
      return (
        <svg className="vb-art vb-art--cracks" viewBox="0 0 240 500" preserveAspectRatio="none">
          {cracks.map((c, i) => (
            <path key={i} d={c.d} pathLength={1} strokeWidth={c.w} style={{ "--d": c.delay } as CSSProperties} />
          ))}
        </svg>
      )
    case "display":
      return (
        <div className="vb-screen">
          <span className="vb-screen__bar">
            <b>{time}</b>
            <i />
          </span>
          <span className="sc-clock vb-screen__clock">{time}</span>
          <span className="vb-screen__ring" />
          <span className="sc-label vb-screen__status">Sistema restaurado</span>
          <span className="vb-screen__notif">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/prototype/redesign/glyph.png" alt="" />
            <span>
              <b>Saymon Cell</b>
              <small>Seu celular está pronto</small>
            </span>
          </span>
        </div>
      )
    case "bateria":
      return (
        <div className="vb-battery">
          <span className="vb-battery__cap" />
          <span className="vb-battery__body">
            {[0, 1, 2, 3].map((c) => (
              <i key={c} />
            ))}
          </span>
          <span className="sc-label vb-battery__spec">Li-ion · 3,85 V</span>
        </div>
      )
    case "placa":
      return (
        <svg className="vb-art" viewBox="0 0 240 500" preserveAspectRatio="none">
          <path className="vb-pcb" d="M28 24 H212 V196 H150 V300 H212 V476 H28 Z" />
          <rect className="vb-chip" x="52" y="54" width="70" height="70" rx="6" />
          <rect className="vb-chip" x="140" y="62" width="48" height="34" rx="4" />
          <rect className="vb-chip vb-chip--sm" x="56" y="160" width="40" height="28" rx="3" />
          <rect className="vb-chip vb-chip--sm" x="110" y="150" width="26" height="40" rx="3" />
          <rect className="vb-chip" x="56" y="340" width="74" height="54" rx="5" />
          <rect className="vb-chip vb-chip--sm" x="150" y="350" width="38" height="38" rx="4" />
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <path key={k} className="vb-trace" d={`M${60 + k * 12} 124 V${150 + k * 6} H${110 + (k % 3) * 8} V${230 + k * 12}`} />
          ))}
          {[0, 1, 2, 3].map((k) => (
            <path key={`b${k}`} className="vb-trace" d={`M${70 + k * 14} 300 V320 H${150 + k * 10} V350`} />
          ))}
          <circle className="vb-pad" cx="196" cy="44" r="7" />
          <circle className="vb-pad" cx="44" cy="456" r="7" />
        </svg>
      )
    case "chassi":
      return (
        <div className="vb-frame">
          <span className="vb-frame__btn vb-frame__btn--a" />
          <span className="vb-frame__btn vb-frame__btn--b" />
          <span className="vb-frame__btn vb-frame__btn--c" />
          <span className="vb-frame__port" />
        </div>
      )
    case "tampa":
      return (
        <div className="vb-back">
          <span className="vb-back__cam">
            <i />
            <i />
            <i />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="vb-back__logo" src="/prototype/redesign/glyph.png" alt="" />
          <span className="vb-back__drops">
            {[0, 1, 2, 3, 4].map((d) => (
              <i key={d} />
            ))}
          </span>
        </div>
      )
  }
}
