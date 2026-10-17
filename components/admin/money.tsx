// Valor em reais no display da home, para os números grandes do painel (início, financeiro, PDV): o
// "R$" pequeno e alto junto do número, e o sinal de menos quando o valor é negativo. O leitor de tela
// ouve o valor inteiro.

import { formatPrice, priceParts } from "@/lib/catalog"
import { cn } from "@/lib/utils"

export function Money({
  value,
  signed = false,
  className,
}: {
  value: number
  /** Mostra o "+" nos valores positivos (entradas do caixa). */
  signed?: boolean
  className?: string
}) {
  const { currency, amount } = priceParts(Math.abs(value))
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : ""
  return (
    <span className={cn("font-display font-black leading-[0.84] tracking-[-0.01em] whitespace-nowrap tabular-nums", className)}>
      <span className="sr-only">
        {value < 0 ? "menos " : ""}
        {formatPrice(Math.abs(value))}
      </span>
      <span aria-hidden="true">
        {sign}
        <span className="mr-[0.12em] inline-block -translate-y-[0.78em] text-[0.46em] tracking-[0.02em]">{currency}</span>
        {amount}
      </span>
    </span>
  )
}
