// Qual versão da home nova cada visitante recebe (ver docs/adr/0001).

export type HomeVersion = "desdobra" | "raio-x"

/** Cookie em que o navegador guarda a versão certa para a próxima visita. */
export const PRESENTATION_COOKIE = "home-versao"

export type PresentationSignals = {
  userAgent?: string
  /** Cabeçalho Sec-CH-UA-Mobile: "?1" quando o navegador se declara móvel. */
  mobileHint?: string | null
  /** Valor do cookie gravado pelo navegador numa visita anterior. */
  cookie?: string
}

export function choosePresentation(signals: PresentationSignals): { version: HomeVersion } {
  if (signals.cookie === "desdobra" || signals.cookie === "raio-x") return { version: signals.cookie }
  const touchDevice = /iPhone|iPad|Android/.test(signals.userAgent ?? "") || signals.mobileHint === "?1"
  return { version: touchDevice ? "raio-x" : "desdobra" }
}
