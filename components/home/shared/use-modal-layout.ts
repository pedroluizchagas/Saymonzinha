"use client"

// Formato das janelas fora da home: folha que sobe de baixo em tela de toque ou estreita (a mesma
// regra da escolha da apresentação, ver docs/adr/0001) e, no computador, o formato pedido.

import { useEffect, useState } from "react"
import { DESKTOP_MIN_WIDTH, TOUCH_QUERY } from "@/lib/home-presentation"

export function useModalLayout<T extends "center" | "side">(desktop: T): "sheet" | T {
  const [layout, setLayout] = useState<"sheet" | T>("sheet")
  useEffect(() => {
    const touch = window.matchMedia(TOUCH_QUERY)
    const wide = window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`)
    const update = () => setLayout(!touch.matches && wide.matches ? desktop : "sheet")
    update()
    touch.addEventListener("change", update)
    wide.addEventListener("change", update)
    return () => {
      touch.removeEventListener("change", update)
      wide.removeEventListener("change", update)
    }
  }, [desktop])
  return layout
}
