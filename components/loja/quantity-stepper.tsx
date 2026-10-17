"use client"

// Escolha da quantidade, de 1 até o estoque: na página do produto e em cada item do carrinho.

import { Minus, Plus } from "lucide-react"

export function QuantityStepper({
  value,
  max,
  onChange,
  label,
  small = false,
}: {
  value: number
  max: number
  onChange: (value: number) => void
  label: string
  small?: boolean
}) {
  return (
    <div className={small ? "lv-qty lv-qty--sm" : "lv-qty"} role="group" aria-label={label}>
      <button type="button" aria-label="Diminuir a quantidade" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        <Minus aria-hidden="true" />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" aria-label="Aumentar a quantidade" disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus aria-hidden="true" />
      </button>
    </div>
  )
}
