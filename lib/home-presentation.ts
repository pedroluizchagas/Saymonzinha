// Qual versão da home nova cada visitante recebe (ver docs/adr/0001).

export type HomeVersion = "desdobra" | "raio-x"

/** Cookie em que o navegador guarda a versão certa para a próxima visita. */
export const PRESENTATION_COOKIE = "home-versao"

/** A Desdobra só aparece a partir desta largura de janela, e só com mouse ou trackpad. */
export const DESKTOP_MIN_WIDTH = 1024

/** Media query do ponteiro principal de toque (celular e tablet; notebook com touch usa o trackpad). */
export const TOUCH_QUERY = "(pointer: coarse)"

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/** Atributos do cookie de versão, para o navegador gravar depois de conferir a tela. */
export const PRESENTATION_COOKIE_ATTRIBUTES = `Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`

/** Estilo que esconde a página enquanto o navegador troca uma versão que o servidor errou. */
export const SWAP_STYLE_ID = "home-trocando"

export type PresentationSignals = {
  userAgent?: string
  /** Cabeçalho Sec-CH-UA-Mobile: "?1" quando o navegador se declara móvel. */
  mobileHint?: string | null
  /** Valor do cookie gravado pelo navegador numa visita anterior. */
  cookie?: string
  /** Só no navegador: se o ponteiro principal é toque e a largura da janela. */
  screen?: { touch: boolean; width: number }
  /** Só no navegador: a pessoa pediu menos movimento no sistema. */
  reducedMotion?: boolean
  /** Só no navegador: memória aproximada em GB (navigator.deviceMemory, só no Chrome e derivados). */
  memoryGb?: number
  /** Só no navegador: núcleos do processador (navigator.hardwareConcurrency). */
  cores?: number
  /** Só no navegador: a página engasgou nos primeiros segundos de rolagem. */
  janky?: boolean
}

export type Presentation = { version: HomeVersion; lite: boolean }

/** Limites de aparelho fraco: ajustados pela medição com CPU simulada. */
export const LITE_MAX_MEMORY_GB = 2
export const LITE_MAX_CORES = 4

const LITE_SUFFIX = ".leve"

/** Valor do cookie: a versão e, se for o caso, o modo leve ("raio-x.leve"). */
export function presentationCookieValue({ version, lite }: Presentation) {
  return lite ? `${version}${LITE_SUFFIX}` : version
}

function parseCookie(cookie: string | undefined): { version?: HomeVersion; lite: boolean } {
  const [version, suffix] = (cookie ?? "").split(".")
  if (version !== "desdobra" && version !== "raio-x") return { lite: false }
  return { version, lite: `.${suffix}` === LITE_SUFFIX }
}

export function choosePresentation(signals: PresentationSignals): Presentation {
  const cookie = parseCookie(signals.cookie)
  return { version: chooseVersion(signals, cookie.version), lite: chooseLite(signals, cookie.lite) }
}

function chooseLite(signals: PresentationSignals, liteBefore: boolean): boolean {
  const { memoryGb, cores } = signals
  // Memória e núcleos só dizem algo em celular e tablet: num computador, 4 núcleos dão conta; lá
  // vale o engasgo medido. E os núcleos só contam com a memória informada, porque o Safari mostra
  // poucos núcleos até em iPhone potente.
  const weak =
    Boolean(signals.screen?.touch) &&
    memoryGb !== undefined &&
    (memoryGb <= LITE_MAX_MEMORY_GB || (cores !== undefined && cores <= LITE_MAX_CORES))
  // A versão leve de uma visita anterior continua: um engasgo medido uma vez vale para as próximas.
  return Boolean(signals.reducedMotion) || weak || Boolean(signals.janky) || liteBefore
}

function chooseVersion(signals: PresentationSignals, versionBefore: HomeVersion | undefined): HomeVersion {
  if (signals.screen) {
    const { touch, width } = signals.screen
    return touch || width < DESKTOP_MIN_WIDTH ? "raio-x" : "desdobra"
  }
  if (versionBefore) return versionBefore
  const touchDevice = /iPhone|iPad|Android/.test(signals.userAgent ?? "") || signals.mobileHint === "?1"
  return touchDevice ? "raio-x" : "desdobra"
}
