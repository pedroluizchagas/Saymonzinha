"use client"

// Confere no navegador a versão e o modo leve que o servidor escolheu e troca ao vivo quando a tela,
// a preferência de movimento ou o desempenho mudam (ver docs/adr/0001). Só a versão em uso fica
// montada, então só os ouvintes dela rodam. As duas vêm no mesmo pacote (cerca de 15 KB a mais, com
// gzip): baixar a outra só na hora da troca deixava o iPad de 1,5 a 2,5 s com a página oculta na
// primeira visita, em produção.

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  DESKTOP_MIN_WIDTH,
  JANK_COOKIE,
  JANK_COOKIE_ATTRIBUTES,
  PRESENTATION_COOKIE,
  PRESENTATION_COOKIE_ATTRIBUTES,
  REDUCED_MOTION_QUERY,
  SWAP_STYLE_ID,
  TOUCH_QUERY,
  choosePresentation,
  presentationCookieValue,
  type Presentation,
} from "@/lib/home-presentation"
import type { Product } from "@/types/database"
import { Desdobra } from "./desdobra/desdobra"
import { RaioX } from "./raio-x/raio-x"
import { QuoteRequestProvider } from "./shared/quote-dialog"

// Engasgo: nos primeiros 2,5 s de rolagem, média abaixo de 42 quadros por segundo ou mais de 20%
// dos quadros acima de 50 ms. Medido nessa janela com CPU simulada no Chrome, a Raio-X fica em
// 48 fps com 4x (celular intermediário), 45 fps com 5x e 40 fps com 6x (celular de entrada), que
// passa para a versão leve.
const JANK_WINDOW_MS = 2500
const JANK_MIN_FPS = 42
const JANK_FRAME_MS = 50
const JANK_SLOW_RATIO = 0.2

/** Mede os quadros a partir da primeira rolagem e avisa se a página engasgar. */
function watchForJank(onJank: () => void) {
  let raf = 0
  let start = 0
  let first = 0
  let last = 0
  let frames = 0
  let slow = 0
  const tick = (now: number) => {
    if (last) {
      frames++
      if (now - last > JANK_FRAME_MS) slow++
    } else {
      first = now
    }
    last = now
    if (now - start < JANK_WINDOW_MS) {
      raf = requestAnimationFrame(tick)
      return
    }
    const fps = (frames * 1000) / (last - first)
    if (frames >= 10 && (fps < JANK_MIN_FPS || slow / frames > JANK_SLOW_RATIO)) onJank()
  }
  const onScroll = () => {
    window.removeEventListener("scroll", onScroll)
    start = performance.now()
    raf = requestAnimationFrame(tick)
  }
  window.addEventListener("scroll", onScroll, { passive: true })
  return () => {
    window.removeEventListener("scroll", onScroll)
    cancelAnimationFrame(raf)
  }
}

export function HomePresentation({ initial, products }: { initial: Presentation; products: Product[] }) {
  const [presentation, setPresentation] = useState(initial)
  const [confirmed, setConfirmed] = useState(false)
  // Para onde rolar depois de uma troca: o topo ou os serviços com a página em uso. Na chegada, a
  // âncora do endereço: a rolagem até ela (do navegador, ou do Next vindo de outra página do site)
  // pode ter valido para a outra versão ou para o conteúdo antes de assentar.
  const scrollAfter = useRef<"top" | "servicos" | "hash" | null>(null)

  // Antes da pintura: vindo de outra página do site (a loja, por exemplo), a navegação é interna, o
  // script de antes da pintura não roda, e a versão errada não pode aparecer.
  useLayoutEffect(() => {
    const touch = window.matchMedia(TOUCH_QUERY)
    const wide = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`)
    const reduce = window.matchMedia(REDUCED_MOTION_QUERY)
    const nav = navigator as Navigator & { deviceMemory?: number }
    const secure = window.location.protocol === "https:" ? "; Secure" : ""
    let current = initial
    let janky = document.cookie.split("; ").includes(`${JANK_COOKIE}=1`)
    let firstCheck = true
    const check = () => {
      const next = choosePresentation({
        screen: { touch: touch.matches, width: window.innerWidth },
        reducedMotion: reduce.matches,
        memoryGb: nav.deviceMemory,
        cores: nav.hardwareConcurrency,
        janky,
      })
      document.cookie = `${PRESENTATION_COOKIE}=${presentationCookieValue(next)}; ${PRESENTATION_COOKIE_ATTRIBUTES}${secure}`
      setConfirmed(true)
      if (firstCheck) scrollAfter.current = "hash"
      if (next.version !== current.version || next.lite !== current.lite) {
        // Com a página em uso, a versão nova recomeça do topo; a Raio-X que fica leve por
        // engasgo vai para a lista de serviços, que é onde a pessoa estava.
        if (!firstCheck) scrollAfter.current = next.version === current.version && next.version === "raio-x" ? "servicos" : "top"
        current = next
        setPresentation(next)
      }
      firstCheck = false
    }
    check()
    touch.addEventListener("change", check)
    wide.addEventListener("change", check)
    reduce.addEventListener("change", check)
    const stopWatching = current.lite
      ? () => {}
      : watchForJank(() => {
          janky = true
          document.cookie = `${JANK_COOKIE}=1; ${JANK_COOKIE_ATTRIBUTES}${secure}`
          check()
        })
    return () => {
      touch.removeEventListener("change", check)
      wide.removeEventListener("change", check)
      reduce.removeEventListener("change", check)
      stopWatching()
    }
  }, [initial])

  // Revela a página depois do render que já mostra a apresentação certa e faz a rolagem pendente.
  useEffect(() => {
    if (confirmed) document.getElementById(SWAP_STYLE_ID)?.remove()
    const target = scrollAfter.current
    scrollAfter.current = null
    if (target === "top") window.scrollTo(0, 0)
    if (target === "servicos") document.getElementById("servicos")?.scrollIntoView()
    // Na Desdobra as âncoras não são ids (ela mesma rola até a seção); aqui só a Raio-X responde.
    const anchor = target === "hash" && window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null
    if (anchor) {
      // A rolagem suave do navegador até a âncora pode ainda estar em curso, e as fontes podem chegar
      // depois e mudar a altura do que vem antes: por 1,2 s a âncora é mantida no lugar, enquanto
      // a pessoa não mexer na página.
      const go = () => anchor.scrollIntoView({ behavior: "instant" as ScrollBehavior })
      let moved = false
      const onMove = () => {
        moved = true
      }
      window.addEventListener("wheel", onMove, { once: true, passive: true })
      window.addEventListener("touchmove", onMove, { once: true, passive: true })
      window.addEventListener("pointerdown", onMove, { once: true, passive: true })
      window.addEventListener("keydown", onMove, { once: true })
      const until = performance.now() + 1200
      const hold = () => {
        if (moved) return
        if (Math.abs(anchor.getBoundingClientRect().top) > 1) go()
        if (performance.now() < until) requestAnimationFrame(hold)
      }
      hold()
      void document.fonts.ready.then(() => {
        if (!moved) go()
      })
    }
  }, [confirmed, presentation])

  const { version, lite } = presentation
  // A janela do pedido fica fora da versão: o que foi preenchido sobrevive a uma troca de versão.
  return (
    <QuoteRequestProvider layout={version === "desdobra" ? "center" : "sheet"}>
      {version === "desdobra" ? <Desdobra products={products} lite={lite} /> : <RaioX products={products} lite={lite} />}
    </QuoteRequestProvider>
  )
}
