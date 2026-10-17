import { describe, expect, test } from "vitest"
import { choosePresentation } from "./home-presentation"

const UA = {
  iphone:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1",
  windows:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  androidPhone:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36",
  androidTablet:
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  oldIpad:
    "Mozilla/5.0 (iPad; CPU OS 12_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1",
  // O Safari do Mac e o do iPad atual mandam esta mesma pista.
  mac: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15",
}

describe("escolha da apresentação no servidor", () => {
  test("um iPhone recebe a Raio-X", () => {
    expect(choosePresentation({ userAgent: UA.iphone }).version).toBe("raio-x")
  })

  test("um computador com Windows recebe a Desdobra", () => {
    expect(choosePresentation({ userAgent: UA.windows }).version).toBe("desdobra")
  })

  test("um celular Android recebe a Raio-X", () => {
    expect(choosePresentation({ userAgent: UA.androidPhone }).version).toBe("raio-x")
  })

  test("um tablet Android recebe a Raio-X", () => {
    expect(choosePresentation({ userAgent: UA.androidTablet }).version).toBe("raio-x")
  })

  test("um iPad antigo, que ainda se identifica como iPad, recebe a Raio-X", () => {
    expect(choosePresentation({ userAgent: UA.oldIpad }).version).toBe("raio-x")
  })

  test("a dica de aparelho móvel do navegador leva à Raio-X", () => {
    expect(choosePresentation({ userAgent: "Mozilla/5.0", mobileHint: "?1" }).version).toBe("raio-x")
  })

  test("um iPad atual, que se identifica como Mac, recebe a Desdobra quando não há cookie", () => {
    expect(choosePresentation({ userAgent: UA.mac }).version).toBe("desdobra")
  })

  test("o cookie da visita anterior vence a pista do aparelho", () => {
    expect(choosePresentation({ userAgent: UA.mac, cookie: "raio-x" }).version).toBe("raio-x")
  })

  test("um cookie inválido é ignorado", () => {
    expect(choosePresentation({ userAgent: UA.iphone, cookie: "sistema" }).version).toBe("raio-x")
  })
})

describe("escolha da apresentação no navegador", () => {
  test("uma tela de toque recebe a Raio-X mesmo larga", () => {
    expect(choosePresentation({ userAgent: UA.mac, screen: { touch: true, width: 1366 } }).version).toBe("raio-x")
  })

  test("com mouse e 1024px ou mais, recebe a Desdobra mesmo com pista de celular", () => {
    expect(choosePresentation({ userAgent: UA.iphone, screen: { touch: false, width: 1024 } }).version).toBe("desdobra")
  })

  test("com mouse e menos de 1024px, recebe a Raio-X", () => {
    expect(choosePresentation({ userAgent: UA.windows, screen: { touch: false, width: 1023 } }).version).toBe("raio-x")
  })

  test("os dados de tela vencem o cookie da visita anterior", () => {
    expect(
      choosePresentation({ userAgent: UA.mac, cookie: "raio-x", screen: { touch: false, width: 1440 } }).version,
    ).toBe("desdobra")
  })
})
