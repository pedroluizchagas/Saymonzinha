"use client"

// PROTÓTIPO — Variante C "Sistema": o site é o sistema operacional de um celular.
// Navegação por toque, não por scroll: bloqueio → home (widgets + apps) → cada app é uma seção.
// No desktop o aparelho fica no palco e a palavra gigante atrás dele troca com o app aberto;
// no celular a moldura some e o site ocupa a tela inteira como se fosse o próprio sistema.

import {
  ArrowUpRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Instagram,
  ListOrdered,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Wrench,
  type LucideIcon,
} from "lucide-react"
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
  WHATSAPP_NUMBER,
  serviceWhatsapp,
  whatsappLink,
} from "../shared/content"
import { StatusBar, useClock } from "../shared/device-ui"
import { ServiceVisual, type VisualKind } from "../shared/service-visual"
import "./variant-c.css"

type AppKey = "orcamento" | "servicos" | "etapas" | "garantia" | "loja" | "endereco" | "numeros" | "marcas"
type App = { key: AppKey; label: string; word: string; icon: LucideIcon; tone: "red" | "ink" | "bone" | "deep" | "carbon" }

const APPS: App[] = [
  { key: "servicos", label: "Serviços", word: "Serviços", icon: Wrench, tone: "ink" },
  { key: "etapas", label: "Etapas", word: "Etapas", icon: ListOrdered, tone: "bone" },
  { key: "garantia", label: "Garantia", word: "Garantia", icon: ShieldCheck, tone: "deep" },
  { key: "loja", label: "Loja", word: "Loja", icon: ShoppingBag, tone: "bone" },
  { key: "endereco", label: "Endereço", word: "Endereço", icon: MapPin, tone: "carbon" },
  { key: "numeros", label: "Números", word: "10 anos", icon: BadgeCheck, tone: "red" },
  { key: "marcas", label: "Marcas", word: "Marcas", icon: Smartphone, tone: "ink" },
  { key: "orcamento", label: "Orçamento", word: "Orçamento", icon: MessageCircle, tone: "red" },
]
const APP_BY_KEY = Object.fromEntries(APPS.map((a) => [a.key, a])) as Record<AppKey, App>

const SAO_PAULO = "America/Sao_Paulo"
const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: SAO_PAULO })

/** Aberto/fechado agora, pelo horário da loja (seg–sex 8–18, sáb 8–12). */
function storeStatus(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23", timeZone: SAO_PAULO })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, p) => ({ ...acc, [p.type]: p.value }), {})
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday)
  const minutes = Number(parts.hour) * 60 + Number(parts.minute)
  const close = day >= 1 && day <= 5 ? 18 * 60 : day === 6 ? 12 * 60 : 0
  if (close && minutes >= 8 * 60 && minutes < close) return { open: true, label: `Aberto agora · fecha às ${close / 60}h` }
  if (close && minutes < 8 * 60) return { open: false, label: "Fechado · abre hoje às 8h" }
  // depois do expediente: sábado reabre na segunda; domingo a sexta, no dia seguinte
  return { open: false, label: day === 6 ? "Fechado · abre segunda às 8h" : "Fechado · abre amanhã às 8h" }
}

function useLiveInfo() {
  const [info, setInfo] = useState<{ date: string; status: { open: boolean; label: string } } | null>(null)
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const date = DATE_FORMAT.format(now)
      setInfo({ date: date.charAt(0).toUpperCase() + date.slice(1), status: storeStatus(now) })
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])
  return info
}

export function VariantC({ products }: { products: Product[] }) {
  const screenRef = useRef<HTMLDivElement>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [app, setApp] = useState<AppKey | null>(null)
  const [closing, setClosing] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const time = useClock()
  const live = useLiveInfo()

  const openApp = (key: AppKey, from?: HTMLElement | null) => {
    const screen = screenRef.current
    if (from && screen) {
      const s = screen.getBoundingClientRect()
      const r = from.getBoundingClientRect()
      setOrigin({ x: ((r.left + r.width / 2 - s.left) / s.width) * 100, y: ((r.top + r.height / 2 - s.top) / s.height) * 100 })
    }
    setClosing(false)
    setApp(key)
  }
  const goHome = () => {
    if (!app) return
    setClosing(true)
    window.setTimeout(() => {
      setApp(null)
      setClosing(false)
    }, 320)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") goHome()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const word = app ? APP_BY_KEY[app].word : null

  return (
    <div className="sc vc" data-unlocked={unlocked ? "1" : "0"} data-app={app ?? "home"}>
      <header className="vc-header">
        <a className="sc-logo" href="?variant=C" aria-label="Saymon Cell, início">
          Saymon <b>Cell</b>
          <sup>®</sup>
        </a>
        <a className="sc-pill sc-pill--red sc-pill--sm" href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          Pedir orçamento <ArrowUpRight />
        </a>
      </header>

      <div className="vc-stage">
        <h1 className="vc-word" aria-live="polite">
          <span className="sc-sr">Saymon Cell — assistência técnica de smartphones em Divinópolis</span>
          <span key={word ?? "home"} className="vc-word__inner" aria-hidden="true" style={{ "--len": (word ?? "Saymon Cell").length } as CSSProperties}>
            {word ?? (
              <>
                Saymon <b>Cell</b>
              </>
            )}
          </span>
        </h1>

        <aside className="vc-side vc-side--left" aria-label="Status da loja">
          <span className="sc-label">
            <i className="vc-dot" data-open={live?.status.open ? "1" : "0"} /> {live?.status.label ?? "Seg–sex 8h–18h · sáb 8h–12h"}
          </span>
          <span className="sc-label vc-muted">
            {ADDRESS.street} · {ADDRESS.district}
          </span>
        </aside>
        <aside className="vc-side vc-side--right">
          <span className="sc-label">WhatsApp {WHATSAPP_DISPLAY}</span>
          <span className="sc-label vc-muted">{unlocked ? (app ? "Esc ou a barra embaixo para voltar" : "Toque num app") : "Toque na tela para desbloquear"}</span>
        </aside>

        <div className="vc-device sc-device">
          <div className="sc-device__bezel">
            <div className="sc-device__screen vc-screen" ref={screenRef}>
              <span className="vc-island" aria-hidden="true">
                <i />
                <b>{app ? APP_BY_KEY[app].label : unlocked ? "Saymon Cell" : "Bloqueado"}</b>
              </span>
              <StatusBar time={time} />

              <HomeView products={products} live={live} onOpen={openApp} />

              {app && (
                <div
                  className="vc-app"
                  data-closing={closing ? "1" : "0"}
                  data-tone={APP_BY_KEY[app].tone}
                  style={{ "--ox": `${origin.x}%`, "--oy": `${origin.y}%` } as CSSProperties}
                  role="dialog"
                  aria-label={APP_BY_KEY[app].label}
                >
                  <AppView app={app} products={products} live={live} onHome={goHome} onOpen={openApp} />
                </div>
              )}

              <LockView time={time} date={live?.date} onUnlock={() => setUnlocked(true)} />

              <button type="button" className="vc-home-bar" aria-label="Voltar para a tela inicial" onClick={goHome}>
                <i />
              </button>
            </div>
          </div>
          <i className="sc-device__btn sc-device__btn--a" />
          <i className="sc-device__btn sc-device__btn--b" />
        </div>
      </div>
    </div>
  )
}

function LockView({ time, date, onUnlock }: { time: string; date?: string; onUnlock: () => void }) {
  const start = useRef<number | null>(null)
  return (
    <div
      className="vc-lock"
      role="button"
      tabIndex={0}
      aria-label="Desbloquear: toque ou deslize para cima"
      onClick={onUnlock}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onUnlock()
        }
      }}
      onPointerDown={(e) => (start.current = e.clientY)}
      onPointerUp={(e) => {
        if (start.current !== null && start.current - e.clientY > 40) onUnlock()
        start.current = null
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="vc-lock__wall" src="/prototype/redesign/teardown.jpg" alt="" />
      <div className="vc-lock__top">
        <p className="sc-ui vc-lock__date">{date ?? "Divinópolis, MG"}</p>
        <p className="sc-clock vc-lock__clock">{time}</p>
      </div>
      <div className="vc-lock__notifs">
        <div className="sc-notif">
          <span className="sc-notif__icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/prototype/redesign/glyph.png" alt="" />
          </span>
          <span>
            <span className="sc-notif__title" style={{ display: "block" }}>
              Saymon Cell
            </span>
            <span className="sc-notif__meta" style={{ display: "block" }}>
              Buscamos seu celular em casa
            </span>
          </span>
          <span className="sc-notif__time">agora</span>
        </div>
      </div>
      <p className="sc-ui vc-lock__hint">Toque ou deslize para cima</p>
    </div>
  )
}

function HomeView({
  products,
  live,
  onOpen,
}: {
  products: Product[]
  live: ReturnType<typeof useLiveInfo>
  onOpen: (key: AppKey, from?: HTMLElement | null) => void
}) {
  return (
    <div className="vc-home">
      <div className="vc-widgets">
        <button type="button" className="vc-widget vc-widget--store" onClick={(e) => onOpen("endereco", e.currentTarget)}>
          <span className="sc-label vc-widget__eyebrow">
            <i className="vc-dot" data-open={live?.status.open ? "1" : "0"} /> Saymon Cell
          </span>
          <span className="sc-display vc-widget__big">{live ? (live.status.open ? "Aberto" : "Fechado") : "Horário"}</span>
          <span className="sc-ui vc-widget__small">{live?.status.label ?? "Seg–sex 8h–18h · sáb 8h–12h"}</span>
        </button>
        <button type="button" className="vc-widget vc-widget--delivery" onClick={(e) => onOpen("etapas", e.currentTarget)}>
          <span className="sc-label">Delivery</span>
          <span className="sc-display vc-widget__mid">Busca e entrega</span>
          <span className="sc-ui vc-widget__small">Divinópolis</span>
        </button>
      </div>

      <div className="vc-grid">
        {APPS.filter((a) => a.key !== "orcamento").map((a, i) => (
          <AppIcon key={a.key} app={a} index={i} onOpen={onOpen} />
        ))}
        <a className="vc-icon" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ "--n": 7 } as CSSProperties}>
          <span className="vc-icon__tile" data-tone="ink">
            <Instagram />
          </span>
          <span className="vc-icon__label">Instagram</span>
        </a>
      </div>

      <button type="button" className="vc-widget vc-widget--wide" onClick={(e) => onOpen("numeros", e.currentTarget)}>
        <span className="sc-label">Saymon Cell em números</span>
        <span className="vc-widget__row">
          {STATS.slice(0, 2).map((s) => (
            <span key={s.label}>
              <b className="sc-display">{s.value}</b>
              <small className="sc-label">{s.label}</small>
            </span>
          ))}
        </span>
      </button>

      <div className="vc-dock">
        <AppIcon app={APP_BY_KEY.orcamento} index={8} onOpen={onOpen} bare />
        <a className="vc-icon" href={whatsappLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
          <span className="vc-icon__tile vc-icon__tile--green">
            <MessageCircle />
          </span>
        </a>
        <a className="vc-icon" href={`tel:+${WHATSAPP_NUMBER}`} aria-label={`Ligar para ${WHATSAPP_DISPLAY}`}>
          <span className="vc-icon__tile" data-tone="bone">
            <Phone />
          </span>
        </a>
        <a className="vc-icon" href={MAPS_URL} target="_blank" rel="noopener noreferrer" aria-label="Abrir no Maps">
          <span className="vc-icon__tile" data-tone="carbon">
            <MapPin />
          </span>
        </a>
      </div>
    </div>
  )
}

function AppIcon({
  app,
  index,
  onOpen,
  bare,
}: {
  app: App
  index: number
  onOpen: (key: AppKey, from?: HTMLElement | null) => void
  bare?: boolean
}) {
  const Icon = app.icon
  return (
    <button type="button" className="vc-icon" style={{ "--n": index } as CSSProperties} onClick={(e) => onOpen(app.key, e.currentTarget)} aria-label={app.label}>
      <span className="vc-icon__tile" data-tone={app.tone}>
        {app.key === "orcamento" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/prototype/redesign/glyph.png" alt="" />
        ) : (
          <Icon />
        )}
      </span>
      {!bare && <span className="vc-icon__label">{app.label}</span>}
    </button>
  )
}

function AppView({
  app,
  products,
  live,
  onHome,
  onOpen,
}: {
  app: AppKey
  products: Product[]
  live: ReturnType<typeof useLiveInfo>
  onHome: () => void
  onOpen: (key: AppKey, from?: HTMLElement | null) => void
}) {
  const [detail, setDetail] = useState<string | null>(null)
  const service = SERVICES.find((s) => s.key === detail)
  const meta = APP_BY_KEY[app]

  return (
    <div className="vc-appview">
      <div className="vc-appbar">
        {service ? (
          <button type="button" className="vc-back" onClick={() => setDetail(null)}>
            <ChevronLeft /> Serviços
          </button>
        ) : (
          <button type="button" className="vc-back" onClick={onHome}>
            <ChevronLeft /> Início
          </button>
        )}
      </div>

      <div className="vc-appbody">
        {service ? (
          <article className="vc-detail">
            <div className="vc-detail__visual">
              <ServiceVisual kind={service.key as VisualKind} />
            </div>
            <span className="sc-label vc-muted">{service.tag}</span>
            <h2 className="sc-display vc-title">{service.title}</h2>
            <p className="sc-body">{service.description}</p>
            <a className="sc-pill sc-pill--red vc-wide" href={serviceWhatsapp(service)} target="_blank" rel="noopener noreferrer">
              Orçar no WhatsApp <ArrowUpRight />
            </a>
          </article>
        ) : (
          <>
            <h2 className="sc-display vc-title">{meta.word}</h2>
            {app === "servicos" && (
              <ul className="vc-list">
                {SERVICES.map((s, i) => (
                  <li key={s.key}>
                    <button type="button" className="vc-list__row" onClick={() => setDetail(s.key)}>
                      <span className="vc-list__num sc-label">{String(i + 1).padStart(2, "0")}</span>
                      <span className="vc-list__text">
                        <span className="sc-ui">{s.title}</span>
                        <span className="vc-list__sub">{s.description}</span>
                      </span>
                      <ChevronRight className="vc-list__chev" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {app === "etapas" && (
              <ol className="vc-steps">
                {STEPS.map((s, i) => (
                  <li key={s.title}>
                    <span className="sc-display vc-steps__num">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="sc-display vc-steps__title">{s.title}</span>
                      <span className="sc-body vc-muted">{s.description}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}

            {app === "garantia" && (
              <ul className="vc-list vc-list--static">
                {GUARANTEES.map((g) => (
                  <li key={g.title} className="vc-list__row">
                    <ShieldCheck className="vc-list__icon" />
                    <span className="vc-list__text">
                      <span className="sc-ui">{g.title}</span>
                      <span className="vc-list__sub">{g.description}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {app === "loja" &&
              (products.length > 0 ? (
                <div className="vc-products">
                  {products.map((p) => (
                    <a className="vc-product" href="/loja" key={p.id}>
                      <span className="vc-product__img">
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
                <ul className="vc-list vc-list--static">
                  {STORE_CATEGORIES.map((c) => (
                    <li key={c} className="vc-list__row">
                      <ShoppingBag className="vc-list__icon" />
                      <span className="vc-list__text">
                        <span className="sc-ui">{c}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ))}
            {app === "loja" && (
              <a className="sc-pill sc-pill--ink vc-wide" href="/loja">
                Abrir a loja completa <ArrowUpRight />
              </a>
            )}

            {app === "endereco" && (
              <div className="vc-place">
                <div className="vc-map" aria-hidden="true">
                  <span className="vc-map__road vc-map__road--a" />
                  <span className="vc-map__road vc-map__road--b" />
                  <span className="vc-map__road vc-map__road--c" />
                  <span className="vc-map__pin">
                    <MapPin />
                  </span>
                  <span className="sc-label vc-map__label">Av. Anhanguera</span>
                </div>
                <p className="sc-display vc-place__street">{ADDRESS.street}</p>
                <p className="sc-body vc-muted">
                  {ADDRESS.unit} · {ADDRESS.district}, {ADDRESS.city} · CEP {ADDRESS.zip}
                </p>
                <dl className="vc-hours">
                  {HOURS.map((h) => (
                    <div key={h.days}>
                      <dt className="sc-body">{h.days}</dt>
                      <dd className="sc-ui">{h.time}</dd>
                    </div>
                  ))}
                </dl>
                {live && (
                  <p className="sc-label">
                    <i className="vc-dot" data-open={live.status.open ? "1" : "0"} /> {live.status.label}
                  </p>
                )}
                <a className="sc-pill sc-pill--white vc-wide" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                  Abrir no Maps <ArrowUpRight />
                </a>
              </div>
            )}

            {app === "numeros" && (
              <div className="vc-stats">
                {STATS.map((s) => (
                  <div className="sc-stat" key={s.label}>
                    <span className="sc-stat__value">{s.value}</span>
                    <span className="sc-label sc-stat__label">{s.label}</span>
                  </div>
                ))}
              </div>
            )}

            {app === "marcas" && (
              <div className="vc-chips">
                {BRANDS.map((b) => (
                  <span className="sc-chip" key={b}>
                    {b}
                  </span>
                ))}
              </div>
            )}

            {app === "orcamento" && <QuoteForm />}
          </>
        )}
      </div>
      <button type="button" className="vc-cta-float" onClick={() => onOpen("orcamento")} hidden={app === "orcamento" || !!service}>
        Pedir orçamento
      </button>
    </div>
  )
}

const BRAND_CHOICES = ["Apple", "Samsung", "Motorola", "Xiaomi", "Outra"]
const PROBLEM_CHOICES = ["Tela", "Bateria", "Conector", "Placa", "Água", "Software"]

/** Pré-orçamento em formato de app. PROTÓTIPO: não grava lead; abre o WhatsApp com o resumo. */
function QuoteForm() {
  const [name, setName] = useState("")
  const [model, setModel] = useState("")
  const [brand, setBrand] = useState("")
  const [problem, setProblem] = useState("")
  const [delivery, setDelivery] = useState<"loja" | "busca">("busca")
  const ready = name.trim().length >= 2 && brand && problem
  const message = useMemo(
    () =>
      `Olá Saymon Cell! Pré-orçamento pelo site:\n\n*Nome:* ${name}\n*Aparelho:* ${brand} ${model}\n*Problema:* ${problem}\n*Entrega:* ${
        delivery === "busca" ? "Quero que busquem" : "Vou levar na loja"
      }`,
    [name, brand, model, problem, delivery],
  )
  return (
    <form
      className="vc-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (ready) window.open(whatsappLink(message), "_blank", "noopener,noreferrer")
      }}
    >
      <label className="vc-field">
        <span className="sc-label">Seu nome</span>
        <input id="vc-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" />
      </label>
      <fieldset className="vc-field">
        <legend className="sc-label">Marca</legend>
        <div className="vc-choices">
          {BRAND_CHOICES.map((b) => (
            <button type="button" key={b} className="vc-choice" aria-pressed={brand === b} onClick={() => setBrand(b)}>
              {b}
            </button>
          ))}
        </div>
      </fieldset>
      <label className="vc-field">
        <span className="sc-label">Modelo</span>
        <input id="vc-model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex.: iPhone 13, Galaxy A54" />
      </label>
      <fieldset className="vc-field">
        <legend className="sc-label">O que aconteceu?</legend>
        <div className="vc-choices">
          {PROBLEM_CHOICES.map((p) => (
            <button type="button" key={p} className="vc-choice" aria-pressed={problem === p} onClick={() => setProblem(p)}>
              {p}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="vc-field">
        <legend className="sc-label">Entrega</legend>
        <div className="vc-segment">
          <button type="button" aria-pressed={delivery === "busca"} onClick={() => setDelivery("busca")}>
            Buscar em casa
          </button>
          <button type="button" aria-pressed={delivery === "loja"} onClick={() => setDelivery("loja")}>
            Levo na loja
          </button>
        </div>
      </fieldset>
      <button type="submit" className="sc-pill sc-pill--red vc-wide" disabled={!ready}>
        Enviar pelo WhatsApp <ArrowUpRight />
      </button>
      <p className="vc-note">Protótipo: o pedido não é salvo no painel; abre o WhatsApp com o resumo.</p>
    </form>
  )
}
