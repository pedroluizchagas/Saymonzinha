// Linha do tempo da Desdobra: o scroll da página, em pixels, dirige o aparelho. A tela trincada
// se conserta, o aparelho desdobra, o conteúdo rola dentro da tela, o aparelho dobra de volta e
// chega a chamada recebida.

export type Timeline = {
  heal: number
  unfoldStart: number
  unfoldEnd: number
  contentEnd: number
  foldEnd: number
  total: number
  travel: number
  /** Posição de scroll da página em que cada seção aparece no topo da tela do celular. */
  anchors: Record<string, number>
}

export function buildTimeline(vh: number, travel: number, sections: { key: string; top: number }[] = []): Timeline {
  const heal = 0.75 * vh
  const unfoldStart = heal + 0.3 * vh
  const unfoldEnd = unfoldStart + 1.1 * vh
  const contentEnd = unfoldEnd + travel
  const foldEnd = contentEnd + 1.1 * vh
  // A âncora fica dentro da fase em que o conteúdo rola: depois dela o aparelho começa a dobrar.
  const lastInside = Math.max(0, travel - 1)
  const anchors = Object.fromEntries(
    sections.map((s) => [s.key, Math.ceil(unfoldEnd + Math.min(Math.max(s.top, 0), lastInside))]),
  )
  return { heal, unfoldStart, unfoldEnd, contentEnd, foldEnd, total: foldEnd + 0.6 * vh, travel, anchors }
}
