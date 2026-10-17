import { describe, expect, test } from "vitest"
import { buildTimeline } from "./timeline"

// Tela de 800px e 3000px de conteúdo para rolar dentro do celular: o conteúdo rola
// entre 1720px (fim do desdobrar) e 4720px (começo do dobrar) de scroll da página.

describe("âncoras da linha do tempo da Desdobra", () => {
  test("a âncora de uma seção fica onde a tela do celular mostra essa seção", () => {
    const timeline = buildTimeline(800, 3000, [{ key: "servicos", top: 900 }])
    expect(timeline.anchors.servicos).toBe(2620)
  })

  test("as âncoras seguem a ordem das seções", () => {
    const timeline = buildTimeline(800, 3000, [
      { key: "servicos", top: 900 },
      { key: "etapas", top: 2100 },
      { key: "contato", top: 2800 },
    ])
    expect(Object.values(timeline.anchors)).toEqual([2620, 3820, 4520])
  })

  test("uma seção no fim do conteúdo não passa do fim da fase em que o conteúdo rola", () => {
    const timeline = buildTimeline(800, 3000, [{ key: "contato", top: 3400 }])
    expect(timeline.anchors.contato).toBe(4719)
  })
})
