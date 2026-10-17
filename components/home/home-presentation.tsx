"use client"

// Confere no navegador a versão que o servidor escolheu e troca ao vivo quando a tela muda
// (ver docs/adr/0001). Só a versão em uso fica montada; a outra só é baixada se precisar trocar.

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import {
  DESKTOP_MIN_WIDTH,
  PRESENTATION_COOKIE,
  PRESENTATION_COOKIE_ATTRIBUTES,
  SWAP_STYLE_ID,
  TOUCH_QUERY,
  choosePresentation,
  type HomeVersion,
} from "@/lib/home-presentation"
import type { Product } from "@/types/database"

const Desdobra = dynamic(() => import("./desdobra/desdobra").then((m) => m.Desdobra))
const RaioX = dynamic(() => import("./raio-x/raio-x").then((m) => m.RaioX))

export function HomePresentation({ initialVersion, products }: { initialVersion: HomeVersion; products: Product[] }) {
  const [version, setVersion] = useState(initialVersion)
  const [confirmed, setConfirmed] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const touch = window.matchMedia(TOUCH_QUERY)
    const wide = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`)
    let current = initialVersion
    let firstCheck = true
    const check = () => {
      const next = choosePresentation({ screen: { touch: touch.matches, width: window.innerWidth } }).version
      const secure = window.location.protocol === "https:" ? "; Secure" : ""
      document.cookie = `${PRESENTATION_COOKIE}=${next}; ${PRESENTATION_COOKIE_ATTRIBUTES}${secure}`
      setConfirmed(true)
      if (next !== current) {
        // Depois da primeira conferência, uma troca é a tela mudando: recomeça do topo da versão nova.
        if (!firstCheck) window.scrollTo(0, 0)
        current = next
        setVersion(next)
      }
      firstCheck = false
    }
    check()
    touch.addEventListener("change", check)
    wide.addEventListener("change", check)
    return () => {
      touch.removeEventListener("change", check)
      wide.removeEventListener("change", check)
    }
  }, [initialVersion])

  // Revela a página quando a versão certa já está montada (o código dela pode ainda estar baixando).
  useEffect(() => {
    if (!confirmed) return
    let frame = 0
    const reveal = () => {
      if (containerRef.current?.firstElementChild) document.getElementById(SWAP_STYLE_ID)?.remove()
      else frame = requestAnimationFrame(reveal)
    }
    reveal()
    return () => cancelAnimationFrame(frame)
  }, [confirmed, version])

  return (
    <div ref={containerRef}>
      {version === "desdobra" ? <Desdobra products={products} /> : <RaioX products={products} />}
    </div>
  )
}
