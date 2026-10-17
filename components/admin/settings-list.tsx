// As listas editáveis das configurações (equipe, marcas e modelos, tipos de serviço, formas de pagamento).
// No celular cada cadastro vira um bloco, com o primeiro campo em cima e os rótulos à vista; do md em diante,
// uma linha por cadastro, com os rótulos das colunas no topo. `columns` é a grade das colunas no md, com a
// última coluna (estreita) para o sinal de que está salvando.

import type React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SettingsList({
  head,
  columns,
  loading,
  empty,
  children,
}: {
  head: string[]
  columns: string
  /** só a primeira carga: ao salvar, a lista recarrega sem sumir */
  loading?: boolean
  empty?: string | false
  children: React.ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-sc-line">
      <div aria-hidden className={cn("hidden gap-4 border-b border-sc-line px-4 py-2.5 md:grid", columns)}>
        {head.map((h) => (
          <span key={h} className="sc-label text-sc-smoke">
            {h}
          </span>
        ))}
      </div>
      {loading ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Carregando
        </p>
      ) : empty ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="divide-y divide-sc-line">{children}</ul>
      )}
    </div>
  )
}

/** Um cadastro: duas colunas no celular (o primeiro campo costuma ocupar as duas), as colunas da lista no md. */
export function SettingsRow({ columns, saving, children }: { columns: string; saving?: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("relative grid grid-cols-2 items-end gap-3 px-4 py-4 md:items-center md:gap-4 md:py-3", columns)}>
      {children}
      <span className="absolute top-4 right-4 md:static" role="status">
        {saving ? <Loader2 className="size-4 animate-spin text-sc-stone" aria-label="Salvando" /> : null}
      </span>
    </li>
  )
}

/** Um campo da linha: o rótulo aparece no celular e, no md, fica só para quem usa leitor de tela. */
export function SettingsField({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("grid min-w-0 gap-1.5", className)}>
      <span className="sc-label text-sc-smoke md:sr-only">{label}</span>
      {children}
    </label>
  )
}

/** "1 marca", "5 marcas". */
export function countLabel(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`
}
