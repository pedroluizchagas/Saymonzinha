// Situação de uma ordem de serviço como etiqueta de bancada: as seis etapas do conserto num traço
// segmentado (as feitas em osso, a atual em vermelho) e o nome da etapa em mono. Cancelada e pedido
// ficam fora do traço. Usada no início do painel, no quadro de OS e na página da OS.

import { cn } from "@/lib/utils"
import type { ServiceOrderStatus } from "@/types/database"

/** As etapas do conserto, na ordem em que a OS anda. */
export const OS_STEPS: ServiceOrderStatus[] = [
  "awaiting_device",
  "in_analysis",
  "awaiting_approval",
  "in_repair",
  "ready",
  "delivered",
]

export const OS_STATUS: Record<ServiceOrderStatus, { label: string; short: string }> = {
  lead: { label: "Pedido de orçamento", short: "Pedido" },
  awaiting_device: { label: "Aguardando aparelho", short: "Aguardando" },
  in_analysis: { label: "Em análise", short: "Análise" },
  awaiting_approval: { label: "Aguardando aprovação", short: "Aprovação" },
  in_repair: { label: "Em reparo", short: "Reparo" },
  ready: { label: "Pronto para entrega", short: "Pronto" },
  delivered: { label: "Entregue", short: "Entregue" },
  cancelled: { label: "Cancelada", short: "Cancelada" },
}

export function OsStatus({
  status,
  long = false,
  className,
}: {
  status: ServiceOrderStatus
  /** O nome inteiro da etapa ("Aguardando aprovação") em vez do curto ("Aprovação"). */
  long?: boolean
  className?: string
}) {
  const step = OS_STEPS.indexOf(status)
  const info = OS_STATUS[status] ?? OS_STATUS.lead
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex gap-[3px]" aria-hidden="true">
        {OS_STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-[3px] w-2.5 rounded-full",
              step === -1 || i > step ? "bg-sc-line" : i === step && status !== "delivered" ? "bg-sc-red" : "bg-sc-stone",
            )}
          />
        ))}
      </span>
      <span
        className={cn(
          "sc-label whitespace-nowrap",
          status === "cancelled" ? "text-sc-smoke line-through" : status === "ready" ? "text-sc-red" : "text-sc-bone",
        )}
      >
        {long ? info.label : info.short}
      </span>
    </span>
  )
}
