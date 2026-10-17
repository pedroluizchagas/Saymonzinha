// Qual versão da home nova cada visitante recebe (ver docs/adr/0001).

export type HomeVersion = "desdobra" | "raio-x"

/** Cookie em que o navegador guarda a versão certa para a próxima visita. */
export const PRESENTATION_COOKIE = "home-versao"

/** A Desdobra só aparece a partir desta largura de janela, e só com mouse ou trackpad. */
export const DESKTOP_MIN_WIDTH = 1024

/** Media query do ponteiro principal de toque (celular e tablet; notebook com touch usa o trackpad). */
export const TOUCH_QUERY = "(pointer: coarse)"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Atributos do cookie de versão, para o navegador gravar depois de conferir a tela. */
export const PRESENTATION_COOKIE_ATTRIBUTES = `Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`

/** Estilo que esconde a página enquanto o navegador troca uma versão que o servidor errou. */
export const SWAP_STYLE_ID = "home-trocando"

/** Variável global em que o script antes da pintura avisa a versão certa quando o servidor errou. */
export const SWAP_GLOBAL = "__homeSwap"

export type PresentationSignals = {
  userAgent?: string
  /** Cabeçalho Sec-CH-UA-Mobile: "?1" quando o navegador se declara móvel. */
  mobileHint?: string | null
  /** Valor do cookie gravado pelo navegador numa visita anterior. */
  cookie?: string
  /** Só no navegador: se o ponteiro principal é toque e a largura da janela. */
  screen?: { touch: boolean; width: number }
}

export function choosePresentation(signals: PresentationSignals): { version: HomeVersion } {
  if (signals.screen) {
    const { touch, width } = signals.screen
    return { version: touch || width < DESKTOP_MIN_WIDTH ? "raio-x" : "desdobra" }
  }
  if (signals.cookie === "desdobra" || signals.cookie === "raio-x") return { version: signals.cookie }
  const touchDevice = /iPhone|iPad|Android/.test(signals.userAgent ?? "") || signals.mobileHint === "?1"
  return { version: touchDevice ? "raio-x" : "desdobra" }
}
