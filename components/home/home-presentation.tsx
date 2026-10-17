"use client"

// Confere no navegador a versão que o servidor escolheu e troca ao vivo quando a tela muda
// (ver docs/adr/0001). Só a versão em uso fica montada, então só os ouvintes dela rodam.
// As duas vêm no mesmo pacote (cerca de 15 KB a mais, com gzip): baixar a outra só na hora da
// troca deixava o iPad de 1,5 a 2,5 s com a página oculta na primeira visita, em produção.

import { useEffect, useState } from "react"
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
import { Desdobra } from "./desdobra/desdobra"
import { RaioX } from "./raio-x/raio-x"
import { QuoteRequestProvider } from "./shared/quote-dialog"

export function HomePresentation({ initialVersion, products }: { initialVersion: HomeVersion; products: Product[] }) {
  const [version, setVersion] = useState(initialVersion)
  const [confirmed, setConfirmed] = useState(false)

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

  // Revela a página depois do render que já mostra a versão certa.
  useEffect(() => {
    if (confirmed) document.getElementById(SWAP_STYLE_ID)?.remove()
  }, [confirmed, version])

  // A janela do pedido fica fora da versão: o que foi preenchido sobrevive a uma troca de versão.
  return (
    <QuoteRequestProvider layout={version === "desdobra" ? "center" : "sheet"}>
      {version === "desdobra" ? <Desdobra products={products} /> : <RaioX products={products} />}
    </QuoteRequestProvider>
  )
}
