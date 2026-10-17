// Chegada com âncora no endereço: a seção é mantida no lugar enquanto a página assenta (a rolagem
// até ela, a troca de versão, as fontes que chegam depois), até a pessoa mexer na página.

/** Por quanto tempo a âncora da chegada é mantida no lugar. */
export const ARRIVAL_HOLD_MS = 2500

const INTERACTIONS = ["wheel", "touchmove", "pointerdown", "keydown"] as const

/** Avisa na primeira vez que a pessoa rola, toca, clica ou tecla. Devolve a função que para de ouvir. */
export function onFirstInteraction(callback: () => void): () => void {
  const stop = () => {
    for (const type of INTERACTIONS) window.removeEventListener(type, handle)
  }
  const handle = () => {
    stop()
    callback()
  }
  for (const type of INTERACTIONS) window.addEventListener(type, handle, { passive: true })
  return stop
}
