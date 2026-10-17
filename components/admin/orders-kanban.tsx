"use client"

// Quadro das ordens de serviço: uma coluna por etapa do conserto, numerada como as etapas da home, e
// cada OS como uma etiqueta de bancada (número, cliente, aparelho, defeito, valor). "Avançar" diz para
// qual etapa a OS vai. No celular, as colunas deslizam uma a uma.

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Eye, MessageCircle, MoreHorizontal, Truck, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { updateServiceOrderStatus } from "@/lib/actions/service-order-actions"
import { formatPrice } from "@/lib/catalog"
import type { ServiceOrder, ServiceOrderStatus } from "@/types/database"
import { OS_STATUS, OS_STEPS } from "./os-status"

interface OrdersKanbanProps {
  orders: ServiceOrder[]
}

/** As colunas: as etapas do conserto, menos a de entregue. */
const COLUMNS = OS_STEPS.slice(0, -1)

export function OrdersKanban({ orders: initialOrders }: OrdersKanbanProps) {
  const [orders, setOrders] = useState(initialOrders)

  const handleStatusChange = async (orderId: string, newStatus: ServiceOrderStatus) => {
    const result = await updateServiceOrderStatus(orderId, newStatus)

    if (result.success) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    }
  }

  const getNextStatus = (currentStatus: ServiceOrderStatus): ServiceOrderStatus | null => {
    const index = OS_STEPS.indexOf(currentStatus)
    return index >= 0 && index < OS_STEPS.length - 1 ? OS_STEPS[index + 1] : null
  }

  return (
    <div className="-mx-4 snap-x snap-mandatory overflow-x-auto px-4 pb-4 md:-mx-8 md:px-8 lg:snap-none">
      <div className="flex min-w-max gap-3 lg:gap-4">
        {COLUMNS.map((status, i) => {
          const columnOrders = orders.filter((order) => order.status === status)

          return (
            <section key={status} aria-labelledby={`coluna-${status}`} className="w-[82vw] max-w-[300px] shrink-0 snap-start lg:w-72">
              <div className="mb-3 flex items-end gap-3 border-b border-sc-line px-1 pb-3">
                <div className="min-w-0">
                  <p className="sc-label text-sc-red">Etapa {String(i + 1).padStart(2, "0")}</p>
                  <h2 id={`coluna-${status}`} className="mt-1.5 truncate text-[15px] font-semibold text-sc-bone">
                    {OS_STATUS[status].label}
                  </h2>
                </div>
                <span className="ml-auto font-display text-[34px] leading-[0.8] font-black tabular-nums text-sc-bone">
                  {columnOrders.length}
                </span>
              </div>

              <div className="space-y-2.5">
                {columnOrders.length === 0 ? (
                  <p className="rounded-[18px] border border-dashed border-sc-line px-4 py-6 text-center text-[13px] text-sc-smoke">
                    Nenhuma OS nesta etapa
                  </p>
                ) : (
                  columnOrders.map((order) => {
                    const next = getNextStatus(order.status)
                    return (
                      <OrderCard
                        key={order.id}
                        order={order}
                        next={next}
                        onMoveNext={() => next && handleStatusChange(order.id, next)}
                        onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      />
                    )
                  })
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

interface OrderCardProps {
  order: ServiceOrder
  next: ServiceOrderStatus | null
  onMoveNext: () => void
  onStatusChange: (status: ServiceOrderStatus) => void
}

function OrderCard({ order, next, onMoveNext, onStatusChange }: OrderCardProps) {
  const formatDate = (date: string) => new Date(date).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit" })
  const price = order.final_price ?? order.estimated_price

  const openWhatsApp = () => {
    if (!order.customer) return
    const phone = order.customer.phone.replace(/\D/g, "")
    let message = ""

    if (order.status === "ready" && order.final_price) {
      message = encodeURIComponent(
        `Olá ${order.customer.name}! Seu aparelho ${order.device_brand} ${order.device_model} está pronto na Saymon Cell. O valor ficou R$ ${order.final_price.toFixed(2)}. Aguardamos você!`,
      )
    } else {
      message = encodeURIComponent(
        `Olá ${order.customer.name}! Aqui é da Saymon Cell. Estou entrando em contato sobre seu aparelho ${order.device_brand} ${order.device_model}.`,
      )
    }

    window.open(`https://wa.me/55${phone}?text=${message}`, "_blank")
  }

  return (
    <article className="group relative rounded-[18px] border border-sc-line bg-sc-carbon p-4 transition-colors hover:border-sc-smoke">
      <div className="flex items-start gap-2">
        <Link
          href={`/admin/orders/${order.id}`}
          className="font-display text-[26px] leading-[0.9] font-black uppercase tracking-[-0.01em] text-sc-bone after:absolute after:inset-0 after:rounded-[18px] after:content-['']"
        >
          OS #{order.order_number}
        </Link>
        <span className="sc-label ml-auto pt-1 text-sc-smoke">{formatDate(order.created_at)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="relative z-10 -mt-1 -mr-1" aria-label={`Ações da OS ${order.order_number}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/admin/orders/${order.id}`}>
                <Eye className="size-4" />
                Ver a OS
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={openWhatsApp} className="cursor-pointer">
              <MessageCircle className="size-4 !text-sc-green" />
              Chamar no WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onStatusChange("cancelled")} className="cursor-pointer">
              <XCircle className="size-4" />
              Cancelar a OS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-3 truncate text-sm font-semibold text-sc-bone">{order.customer?.name || "Cliente"}</p>
      <p className="sc-label mt-1 truncate text-sc-stone">
        {order.device_brand} {order.device_model}
      </p>
      <p className="mt-2.5 line-clamp-2 text-[13px] leading-[1.4] text-sc-stone">{order.problem_description}</p>

      {(price || order.delivery_type === "delivery") && (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {price ? (
            <span className="text-sm font-semibold tabular-nums text-sc-bone">
              {formatPrice(price)}
              {!order.final_price && <span className="ml-1 text-[12px] font-normal text-sc-smoke">estimado</span>}
            </span>
          ) : null}
          {order.delivery_type === "delivery" && (
            <span className="sc-label ml-auto flex items-center gap-1 whitespace-nowrap text-sc-stone">
              <Truck className="size-3" aria-hidden="true" /> Busca e entrega
            </span>
          )}
        </div>
      )}

      {next && (
        <Button onClick={onMoveNext} variant="secondary" size="sm" className="relative z-10 mt-3.5 w-full justify-between">
          <span>
            Avançar para <span className="text-sc-stone">{OS_STATUS[next].short.toLowerCase()}</span>
          </span>
          <ArrowRight aria-hidden="true" />
        </Button>
      )}
    </article>
  )
}
