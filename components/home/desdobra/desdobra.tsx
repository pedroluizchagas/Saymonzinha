"use client"

// Home nova, versão de desktop "Desdobra": a adaptação literal do Foldfolio.
// O site inteiro vive dentro de um celular dobrável no palco:
//   tela de bloqueio trincada → o scroll conserta o vidro → o aparelho desdobra →
//   o conteúdo rola dentro da tela → dobra de volta → chamada recebida (WhatsApp).
// O scroll da página vira uma linha do tempo; tudo é dirigido por variáveis CSS.

import { ArrowDown, ArrowUpRight, Check, Instagram, MessageCircle, Moon, Package, Sun } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react"
import type { Product } from "@/types/database"
import { ARRIVAL_HOLD_MS, onFirstInteraction } from "../shared/arrival"
import {
  ADDRESS,
  BRANDS,
  GUARANTEES,
  HEADLINE_KICKER,
  HOURS,
  INSTAGRAM_URL,
  MAPS_URL,
  MENU,
  PARKING_NOTE,
  PHONE_URL,
  PICKUP_NOTE,
  SECTIONS,
  SERVICES,
  STATS,
  STEPS,
  STORE_CATEGORIES,
  WHATSAPP_DISPLAY,
  whatsappLink,
} from "../shared/content"
import { makeCracks } from "../shared/crack"
import { CallSlider, StatusBar, useClock } from "../shared/device-ui"
import { HeaderActions } from "../shared/header-actions"
import { HomeFooter } from "../shared/home-footer"
import { useQuoteRequest } from "../shared/quote-dialog"
import { ServiceVisual, type VisualKind } from "../shared/service-visual"
// O CSS do sistema vem antes do da versão: as regras da versão sobrescrevem as do sistema.
import "../sc-system.css"
import "./desdobra.css"
import { buildTimeline, type Timeline } from "./timeline"

type Geometry = { vw: number; vh: number; W: number; H: number; f: number }
type SectionMark = { key: string; tab: string; top: number; glow: string; bar: string }

const FINISHES = [
  { key: "grafite", label: "Grafite", color: "var(--finish-grafite)" },
  { key: "vermelho", label: "Vermelho", color: "var(--finish-vermelho)" },
  { key: "titanio", label: "Titânio", color: "var(--finish-titanio)" },
  { key: "osso", label: "Osso", color: "var(--finish-osso)" },
]

const TABS = [
  { key: "inicio", label: "Início", short: "Início" },
  { key: "servicos", label: "Serviços", short: "Serviços" },
  { key: "etapas", label: "Como funciona", short: "Etapas" },
  { key: "loja", label: "Loja", short: "Loja" },
  { key: "contato", label: "Contato", short: "Contato" },
]

// Âncoras do endereço (as do cabeçalho e do rodapé da loja) e a seção da tela do celular que cada
// uma mostra.
const HASH_SECTIONS: Record<string, string> = {
  servicos: "servicos",
  "como-funciona": "etapas",
  sobre: "sobre",
  localizacao: "contato",
}

const PANEL_TONES = ["red", "ink", "bone", "deep", "carbon", "bone"] as const
const PANEL_GLOW = [
  "rgba(255,2,0,.62)",
  "rgba(255,2,0,.28)",
  "rgba(244,243,240,.3)",
  "rgba(179,23,15,.6)",
  "rgba(255,2,0,.3)",
  "rgba(244,243,240,.3)",
]
const PANEL_BAR = ["ink", "white", "split-ink", "white", "white", "split-ink"]

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Só paisagem: a Desdobra aparece a partir de 1024px de largura (ver docs/adr/0001).
function computeGeometry(vw: number, vh: number): Geometry {
  const f = 13
  const H = Math.min(720, vh - 168, (vw - 96) / 1.478)
  return { vw, vh, W: H * 1.478, H, f }
}

export function Desdobra({ products, lite }: { products: Product[]; lite: boolean }) {
  const quote = useQuoteRequest()
  const rootRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const clipRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<Timeline | null>(null)
  const marksRef = useRef<SectionMark[]>([])
  const activeRef = useRef("inicio")
  const healedRef = useRef(false)

  const [geo, setGeo] = useState<Geometry | null>(null)
  const [pageHeight, setPageHeight] = useState<number | null>(null)
  const [stage, setStage] = useState<"noite" | "papel">("noite")
  const [finish, setFinish] = useState(FINISHES[0].key)
  const [active, setActive] = useState("inicio")
  const [healed, setHealed] = useState(false)
  const time = useClock()

  // Versão leve (menos movimento, aparelho fraco ou engasgo): aparelho aberto e rolagem nativa na tela.
  const reduced = lite

  useLayoutEffect(() => {
    const measure = () => setGeo(computeGeometry(window.innerWidth, window.innerHeight))
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [])

  // mede o conteúdo da tela e as seções para montar a linha do tempo
  useLayoutEffect(() => {
    const content = contentRef.current
    if (!geo || !content) return
    const measure = () => {
      const travel = Math.max(0, content.scrollHeight - geo.H)
      marksRef.current = Array.from(content.querySelectorAll<HTMLElement>("[data-section]")).map((el) => ({
        key: el.dataset.section ?? "",
        tab: el.dataset.tab ?? el.dataset.section ?? "",
        top: el.offsetTop,
        glow: el.dataset.glow ?? "",
        bar: el.dataset.bar ?? "white",
      }))
      const tl = buildTimeline(geo.vh, travel, marksRef.current)
      timelineRef.current = tl
      setPageHeight(tl.total + geo.vh)
      window.dispatchEvent(new Event("scroll"))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(content)
    return () => ro.disconnect()
  }, [geo])

  // o scroll da página dirige o aparelho
  useEffect(() => {
    const root = rootRef.current
    if (!root || !geo || reduced) return
    let raf = 0
    const update = () => {
      raf = 0
      const tl = timelineRef.current
      if (!tl) return
      const y = window.scrollY
      const heal = clamp(y / tl.heal)
      let open = 0
      if (y >= tl.unfoldStart && y < tl.unfoldEnd) open = easeInOut((y - tl.unfoldStart) / (tl.unfoldEnd - tl.unfoldStart))
      else if (y >= tl.unfoldEnd && y < tl.contentEnd) open = 1
      else if (y >= tl.contentEnd && y < tl.foldEnd) open = 1 - easeInOut((y - tl.contentEnd) / (tl.foldEnd - tl.contentEnd))
      const scroll = clamp(y - tl.unfoldEnd, 0, tl.travel)

      // mantém a parte visível do aparelho centrada enquanto a metade gira
      const phi = (1 - open) * 180
      const D = geo.W + 2 * geo.f
      const edge = (D / 2) * (1 - Math.cos((phi * Math.PI) / 180))
      const visStart = Math.min(edge, D / 2)
      const shift = D / 2 - (visStart + D) / 2

      const s = root.style
      s.setProperty("--heal", heal.toFixed(4))
      s.setProperty("--open", open.toFixed(4))
      s.setProperty("--phi", `${phi.toFixed(3)}deg`)
      s.setProperty("--shift", `${shift.toFixed(2)}px`)
      s.setProperty("--vis", `${(D - visStart).toFixed(1)}px`)
      s.setProperty("--scroll", `${(-scroll).toFixed(1)}px`)
      root.dataset.unified = open > 0.999 ? "1" : "0"
      root.dataset.cover = y >= tl.contentEnd ? "call" : "lock"

      let mark = marksRef.current[0]
      let barMark = mark
      for (const m of marksRef.current) {
        if (m.top <= scroll + geo.H * 0.35) mark = m
        if (m.top <= scroll + 22) barMark = m
      }
      if (barMark) root.dataset.bar = barMark.bar
      if (mark) {
        const glow = open > 0.5 ? mark.glow : root.dataset.cover === "call" ? "rgba(52,199,89,.32)" : ""
        if (glow) s.setProperty("--glow", glow)
        else s.removeProperty("--glow")
        if (mark.tab !== activeRef.current) {
          activeRef.current = mark.tab
          setActive(mark.tab)
        }
      }
      const isHealed = heal >= 1
      if (isHealed !== healedRef.current) {
        healedRef.current = isHealed
        setHealed(isHealed)
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [geo, reduced, pageHeight])

  const navigate = useCallback(
    (tab: string, behavior: ScrollBehavior = "smooth") => {
      const mark = marksRef.current.find((m) => m.tab === tab || m.key === tab)
      if (!mark) return
      if (reduced) {
        clipRef.current?.scrollTo({ top: mark.top, behavior })
        return
      }
      const top = timelineRef.current?.anchors[mark.key]
      if (top !== undefined) window.scrollTo({ top, behavior })
    },
    [reduced],
  )

  // Âncora no endereço ao chegar (vinda do cabeçalho da loja, por exemplo) e quando ela muda. Na
  // chegada, cada nova medida mantém a seção no lugar enquanto o conteúdo assenta (vindo de outra
  // página do site, as fontes chegam depois e mudam a altura do conteúdo), até a pessoa mexer na página.
  // Seção da chegada: undefined antes de ler o endereço; null sem âncora ou depois de soltar.
  const arrivalSectionRef = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (pageHeight === null) return
    if (arrivalSectionRef.current === undefined) {
      arrivalSectionRef.current = HASH_SECTIONS[window.location.hash.slice(1)] ?? null
      if (arrivalSectionRef.current) {
        const release = () => {
          arrivalSectionRef.current = null
        }
        const stop = onFirstInteraction(release)
        window.setTimeout(() => {
          stop()
          release()
        }, ARRIVAL_HOLD_MS)
      }
    }
    // "instant" (os navegadores aceitam; os tipos do TS daqui ainda não): o html tem scroll suave,
    // e "auto" faria a animação inteira rodar até a seção.
    if (arrivalSectionRef.current) navigate(arrivalSectionRef.current, "instant" as ScrollBehavior)
  }, [pageHeight, navigate])
  useEffect(() => {
    const onHash = () => {
      const section = HASH_SECTIONS[window.location.hash.slice(1)]
      if (section) navigate(section)
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [navigate])

  // foco por teclado dentro da tela: rola a página até o elemento
  const onFocusIn = useCallback(
    (e: React.FocusEvent) => {
      const tl = timelineRef.current
      const content = contentRef.current
      if (reduced || !tl || !content || !geo) return
      let top = 0
      for (let el = e.target as HTMLElement | null; el && el !== content; el = el.offsetParent as HTMLElement | null) top += el.offsetTop
      const current = clamp(window.scrollY - tl.unfoldEnd, 0, tl.travel)
      if (top < current + 60 || top > current + geo.H - 120) {
        window.scrollTo({ top: tl.unfoldEnd + clamp(top - geo.H * 0.4, 0, tl.travel) + 1 })
      }
    },
    [geo, reduced],
  )

  const finishColor = FINISHES.find((f) => f.key === finish)?.color
  const vars = useMemo(() => {
    if (!geo) return undefined
    const closed = (geo.W + 2 * geo.f) / 2
    const closedH = geo.H + 2 * geo.f
    const side = (geo.vw - closed) / 2
    const overlap = closed * 0.1
    const saymon = Math.min((side - 24 + overlap) / 2.62, closedH * 0.36)
    const cell = Math.min((side - 24 + overlap) / 1.42, 300, closedH * 0.5)
    return {
      "--screen-w": `${geo.W}px`,
      "--screen-h": `${geo.H}px`,
      "--frame": `${geo.f}px`,
      "--closed-w": `${closed}px`,
      "--closed-h": `${closedH}px`,
      "--wm-saymon": `${saymon}px`,
      "--wm-cell": `${cell}px`,
      "--wm-overlap": `${overlap}px`,
      "--finish-current": finishColor,
    } as CSSProperties
  }, [geo, finishColor])

  return (
    <div
      ref={rootRef}
      id="inicio"
      className="sc va"
      data-stage={stage}
      data-axis="x"
      data-motion={reduced ? "reduced" : "full"}
      data-ready={geo ? "1" : "0"}
      data-unified="0"
      data-cover="lock"
      data-bar="split"
      style={vars}
    >
      <div className="va-scroller" style={{ height: reduced ? undefined : pageHeight ?? undefined }}>
        <div className="va-stage">
          <div className="sc-glow va-glow" aria-hidden="true" />
          <h1 className="va-wordmark">
            <span className="sc-label va-wordmark__kicker">{HEADLINE_KICKER}</span>{" "}
            <span className="sc-wordmark va-wordmark__saymon">Saymon</span>{" "}
            <span className="sc-wordmark sc-wordmark--cell va-wordmark__cell">Cell</span>
          </h1>
          <div className="va-floor" aria-hidden="true" />

          <div className="va-device">
            {/* metade B: direita (paisagem) ou de baixo (retrato) */}
            <div className="va-half va-half--b" aria-hidden="true">
              <DeviceShell>
                <ScreenCopy products={products} time={time} />
              </DeviceShell>
            </div>

            {/* metade A: gira na dobradiça; o verso é a tela externa */}
            <div className="va-half va-half--a">
              <div className="va-face va-face--front" aria-hidden="true">
                <DeviceShell>
                  <ScreenCopy products={products} time={time} />
                </DeviceShell>
              </div>
              <div className="va-face va-face--back">
                <div className="sc-device va-cover">
                  <div className="sc-device__bezel">
                    <div className="sc-device__screen va-cover__screen">
                      <span className="va-punch" aria-hidden="true" />
                      <div className="va-cover__lock">
                        <LockScreen time={time} healed={healed} />
                      </div>
                      <div className="va-cover__call">
                        <CallScreen time={time} />
                      </div>
                    </div>
                  </div>
                  <i className="sc-device__btn sc-device__btn--a" />
                  <i className="sc-device__btn sc-device__btn--b" />
                </div>
              </div>
            </div>

            {/* camada interativa, visível com o aparelho aberto */}
            <div className="va-unified">
              <DeviceShell clipRef={clipRef}>
                <div className="va-content-wrap" onFocusCapture={onFocusIn}>
                  <ScreenContent ref={contentRef} products={products} onNav={navigate} />
                </div>
                <StatusBar time={time} />
                <nav className="va-tabbar-wrap" aria-label="Seções">
                  <div className="sc-tabbar">
                    {TABS.map((t) => (
                      <button key={t.key} type="button" className="sc-tab" aria-current={active === t.key} onClick={() => navigate(t.key)}>
                        <span className="va-tab-long">{t.label}</span>
                        <span className="va-tab-short">{t.short}</span>
                      </button>
                    ))}
                  </div>
                </nav>
              </DeviceShell>
            </div>
          </div>
        </div>
      </div>

      <header className="va-header">
        <a className="sc-logo" href="#inicio" aria-label="Saymon Cell, início">
          Saymon <b>Cell</b>
          <sup>®</sup>
        </a>
        <nav className="va-menu" aria-label="Menu">
          {MENU.map((item) => (
            <a
              key={item.href}
              className="sc-label"
              href={item.href}
              onClick={(e) => {
                const section = HASH_SECTIONS[item.href.slice(1)]
                if (!section) return
                e.preventDefault()
                window.history.replaceState(null, "", item.href)
                navigate(section)
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <HeaderActions />
      </header>

      <div className="va-controls">
        <div className="sc-swatches" role="group" aria-label="Acabamento do aparelho">
          {FINISHES.map((f) => (
            <button
              key={f.key}
              type="button"
              className="sc-swatch"
              aria-label={f.label}
              title={f.label}
              aria-pressed={finish === f.key}
              style={{ "--swatch": f.color } as CSSProperties}
              onClick={() => setFinish(f.key)}
            />
          ))}
          <span className="va-controls__sep" aria-hidden="true" />
          <button
            type="button"
            className="va-stage-toggle"
            aria-label={stage === "noite" ? "Usar palco claro" : "Usar palco escuro"}
            onClick={() => setStage((s) => (s === "noite" ? "papel" : "noite"))}
          >
            {stage === "noite" ? <Sun /> : <Moon />}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeviceShell({ children, clipRef }: { children: React.ReactNode; clipRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div className="sc-device va-shell">
      <div className="sc-device__bezel">
        <div className="sc-device__screen va-screen">
          <div className="va-clip" ref={clipRef}>
            {children}
          </div>
          <span className="va-crease" aria-hidden="true" />
        </div>
      </div>
      <i className="sc-device__btn sc-device__btn--a" />
      <i className="sc-device__btn sc-device__btn--b" />
    </div>
  )
}

/** Cópia decorativa do conteúdo para as metades que giram (sem foco, sem leitor de tela). */
function ScreenCopy({ products, time }: { products: Product[]; time: string }) {
  // Montadas só no navegador: no HTML o conteúdo aparece uma vez só (na camada interativa).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <>
      <div className="va-content-wrap" inert>
        {mounted && <ScreenContent products={products} />}
      </div>
      <StatusBar time={time} />
    </>
  )
}

function ScreenContent({ products, onNav, ref }: { products: Product[]; onNav?: (tab: string) => void; ref?: React.Ref<HTMLDivElement> }) {
  const quote = useQuoteRequest()
  return (
    <div className="va-content" ref={ref}>
      <section className="va-hero" data-section="inicio" data-tab="inicio" data-glow="rgba(244,243,240,.26)" data-bar="split">
        <div className="va-hero__text">
          <p className="sc-label">{SECTIONS.region}</p>
          <div className="va-hero__bottom">
            <h2 className="sc-display sc-display--hero">
              Conserto sem sair de casa<span className="va-dot">.</span>
            </h2>
            <p className="sc-body va-hero__lead">
              A tela quebrou ou a bateria viciou? A Saymon Cell busca, conserta e devolve seu aparelho novo de novo.
            </p>
            <p className="sc-label va-muted">{PICKUP_NOTE}</p>
            <div className="va-actions">
              <button type="button" className="sc-pill sc-pill--red" onClick={() => quote.open()}>
                Pedir orçamento <ArrowUpRight />
              </button>
              <button type="button" className="sc-pill sc-pill--soft" onClick={() => onNav?.("etapas")}>
                Como funciona
              </button>
            </div>
          </div>
        </div>
        <div className="va-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home/teardown.jpg" alt="Interior de um smartphone aberto na bancada" />
        </div>
      </section>

      <section className="va-block va-numbers" data-section="numeros" data-tab="inicio" data-glow="rgba(255,2,0,.34)" data-bar="white">
        <p className="sc-label va-muted">10 anos em números</p>
        <div className="va-stats">
          {STATS.map((s) => (
            <div className="sc-stat" key={s.label}>
              <span className="sc-stat__value">{s.value}</span>
              <span className="sc-label sc-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="va-block va-services-head" data-section="servicos" data-tab="servicos" data-glow="rgba(255,2,0,.42)" data-bar="white">
        <h2 className="sc-display sc-display--section">Serviços</h2>
        <a className="sc-pill sc-pill--ghost sc-pill--sm" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          Orçar no WhatsApp <ArrowUpRight />
        </a>
      </section>

      {SERVICES.map((service, i) => (
        <article
          key={service.key}
          className={`sc-panel sc-panel--${PANEL_TONES[i]}`}
          data-section={`servico-${service.key}`}
          data-tab="servicos"
          data-glow={PANEL_GLOW[i]}
          data-bar={PANEL_BAR[i]}
        >
          <div className="sc-panel__visual">
            <ServiceVisual kind={service.key as VisualKind} />
          </div>
          <div className="sc-panel__body">
            <span className="sc-display sc-display--numeral sc-panel__num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="sc-panel__text">
              <span className="sc-label">{service.tag}</span>
              <h3 className="sc-display sc-display--title">{service.title}</h3>
              <p className="sc-body">{service.description}</p>
              <button type="button" className="sc-label sc-panel__link" onClick={() => quote.open(service.problem)}>
                Pedir orçamento <ArrowUpRight />
              </button>
            </div>
          </div>
        </article>
      ))}

      <section className="va-block va-steps" data-section="etapas" data-tab="etapas" data-glow="rgba(255,2,0,.3)" data-bar="white">
        <p className="sc-label va-muted">{SECTIONS.steps.label}</p>
        <h2 className="sc-display sc-display--title">{SECTIONS.steps.title}</h2>
        <ol className="va-rows">
          {STEPS.map((step, i) => (
            <li className="sc-row" key={step.title}>
              <span className="sc-label sc-row__index">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="sc-display sc-display--row">{step.title}</h3>
              <p className="sc-body sc-row__desc">{step.description}</p>
            </li>
          ))}
        </ol>

        {/* "Sobre Nós", no rodapé da loja, chega aqui */}
        <p className="sc-label va-muted" data-section="sobre" data-tab="etapas" data-glow="rgba(255,2,0,.3)" data-bar="white">
          {SECTIONS.why.label}
        </p>
        <h2 className="sc-display sc-display--title">{SECTIONS.why.title}</h2>
        <ul className="va-guarantees">
          {GUARANTEES.map((g) => (
            <li key={g.title}>
              <Check aria-hidden="true" />
              <div>
                <p className="sc-ui">{g.title}</p>
                <p className="sc-body va-muted">{g.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="sc-label va-muted">{SECTIONS.brands.label}</p>
        <div className="va-chips">
          {BRANDS.map((b) => (
            <span className="sc-chip" key={b}>
              {b}
            </span>
          ))}
        </div>
      </section>

      <section className="va-block va-store" data-section="loja" data-tab="loja" data-glow="rgba(244,243,240,.3)" data-bar="ink">
        <div className="va-store__head">
          <div>
            <p className="sc-label">{SECTIONS.store.label}</p>
            <h2 className="sc-display sc-display--section">{SECTIONS.store.title}</h2>
          </div>
          <a className="sc-pill sc-pill--ink" href="/loja">
            Ver a loja <ArrowUpRight />
          </a>
        </div>
        {products.length > 0 ? (
          <div className="va-products">
            {products.map((p) => (
              <a className="va-product" href="/loja" key={p.id}>
                <span className="va-product__img">
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
          <div className="va-chips">
            {STORE_CATEGORIES.map((c) => (
              <span className="sc-chip sc-chip--light" key={c}>
                {c}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="va-visit" data-section="contato" data-tab="contato" data-glow="rgba(255,2,0,.62)" data-bar="ink">
        <div className="va-visit__address">
          <p className="sc-label">{SECTIONS.visit.label}</p>
          <h2 className="sc-display sc-display--title">{ADDRESS.street}</h2>
          <p className="sc-body">
            {ADDRESS.unit} · {ADDRESS.district}
            <br />
            {ADDRESS.city} · CEP {ADDRESS.zip}
          </p>
          <p className="sc-body">{PARKING_NOTE}</p>
          <a className="sc-pill sc-pill--ink" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
            Abrir no Maps <ArrowUpRight />
          </a>
        </div>
        <div className="va-visit__hours">
          <p className="sc-label va-muted">Horário</p>
          <dl>
            {HOURS.map((h) => (
              <div key={h.days}>
                <dt className="sc-body">{h.days}</dt>
                <dd className="sc-display sc-display--row">{h.time}</dd>
              </div>
            ))}
          </dl>
          <p className="sc-label va-muted">{SECTIONS.visit.contact}</p>
          <a className="sc-display sc-display--row va-phone" href={PHONE_URL}>
            {WHATSAPP_DISPLAY}
          </a>
        </div>
      </section>

      <section className="va-block va-end" data-section="fim" data-tab="contato" data-glow="rgba(255,2,0,.4)" data-bar="white">
        <div className="sc-cta">
          <div>
            <h2 className="sc-display sc-display--row">Tela trincada? A gente busca.</h2>
            <p className="sc-label sc-cta__note">{PICKUP_NOTE}</p>
          </div>
          <div className="sc-cta__actions">
            <button type="button" className="sc-pill sc-pill--red" onClick={() => quote.open()}>
              Pedir orçamento <ArrowUpRight />
            </button>
            <a className="sc-pill sc-pill--ink" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              Chamar no WhatsApp <ArrowUpRight />
            </a>
          </div>
        </div>
        <footer className="va-footer">
          <HomeFooter />
        </footer>
      </section>
    </div>
  )
}

function LockScreen({ time, healed }: { time: string; healed: boolean }) {
  const cracks = useMemo(() => makeCracks(42, 520, 720, 352, 452), [])
  return (
    <div className="va-lock">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="va-lock__wall" src="/home/teardown.jpg" alt="" />
      <StatusBar time={time} level={healed ? 100 : 12} />
      <div className="va-lock__top">
        <div className="sc-clock va-lock__clock">{time}</div>
        <p className="sc-ui va-lock__date">{SECTIONS.region}</p>
      </div>
      <div className="va-lock__notifs">
        <div className="sc-notif va-lock__fixed" data-on={healed ? "1" : "0"} aria-hidden={!healed}>
          <span className="sc-notif__icon va-icon--green">
            <Check strokeWidth={3} />
          </span>
          <span>
            <span className="sc-notif__title" style={{ display: "block" }}>
              Tela nova instalada
            </span>
            <span className="sc-notif__meta" style={{ display: "block" }}>
              Saymon Cell · garantia ativa
            </span>
          </span>
          <span className="sc-notif__time">agora</span>
        </div>
        <div className="sc-notif">
          <span className="sc-notif__icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/glyph.png" alt="" />
          </span>
          <span>
            <span className="sc-notif__title" style={{ display: "block" }}>
              Busca e entrega em Divinópolis
            </span>
            <span className="sc-notif__meta" style={{ display: "block" }}>
              Consulte disponibilidade e valor
            </span>
          </span>
          <span className="sc-notif__time">agora</span>
        </div>
        <div className="sc-notif va-lock__secondary">
          <span className="sc-notif__icon va-icon--ink">
            <MessageCircle />
          </span>
          <span>
            <span className="sc-notif__title" style={{ display: "block" }}>
              Tela trincada?
            </span>
            <span className="sc-notif__meta" style={{ display: "block" }}>
              Troca de tela com garantia
            </span>
          </span>
          <span className="sc-notif__time">2 min</span>
        </div>
      </div>
      <div className="va-lock__dock">
        <a className="sc-roundbtn" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram da Saymon Cell">
          <Instagram />
        </a>
        <span className="sc-pill sc-pill--glass sc-pill--sm va-lock__hint">
          {healed ? "Role para abrir" : "Role para consertar"} <ArrowDown />
        </span>
        <a className="sc-roundbtn" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="Chamar no WhatsApp">
          <MessageCircle />
        </a>
      </div>
      <svg className="va-crack" viewBox="0 0 520 720" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        {cracks.map((c, i) => (
          <path key={i} d={c.d} pathLength={1} strokeWidth={c.w} style={{ "--d": c.delay } as CSSProperties} />
        ))}
        <circle className="va-crack__impact" cx="352" cy="452" r="7" />
      </svg>
      <span className="va-scan" aria-hidden="true" />
    </div>
  )
}

function CallScreen({ time }: { time: string }) {
  return (
    <div className="sc-call va-call">
      <StatusBar time={time} />
      <h2 className="sc-display sc-display--title va-call__name">Saymon Cell</h2>
      <p className="sc-ui sc-call__sub">{SECTIONS.call.label}</p>
      <div className="sc-call__avatar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/glyph.png" alt="" />
      </div>
      <div className="sc-call__foot">
        <CallSlider href={whatsappLink(SECTIONS.call.message)} />
        <span className="sc-label va-muted">WhatsApp {WHATSAPP_DISPLAY}</span>
      </div>
    </div>
  )
}
