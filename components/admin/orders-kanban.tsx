"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Clock,
  Search,
  Wrench,
  CheckCircle2,
  Package,
  XCircle,
  MessageCircle,
  Eye,
  ArrowRight,
} from "lucide-react"
import { updateServiceOrderStatus } from "@/lib/actions/service-order-actions"
import type { ServiceOrder, ServiceOrderStatus } from "@/types/database"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface OrdersKanbanProps {
  orders: ServiceOrder[]
}

const KANBAN_COLUMNS: {
  status: ServiceOrderStatus
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  { status: "awaiting_device", title: "Aguardando Aparelho", icon: Clock, color: "text-yellow-500" },
  { status: "in_analysis", title: "Em Análise", icon: Search, color: "text-blue-500" },
  { status: "awaiting_approval", title: "Aguardando Aprovação", icon: Clock, color: "text-orange-500" },
  { status: "in_repair", title: "Em Reparo", icon: Wrench, color: "text-purple-500" },
  { status: "ready", title: "Pronto para Entrega", icon: CheckCircle2, color: "text-green-500" },
  { status: "delivered", title: "Finalizado", icon: Package, color: "text-gray-500" },
]

export function OrdersKanban({ orders: initialOrders }: OrdersKanbanProps) {
  const [orders, setOrders] = useState(initialOrders)

  const handleStatusChange = async (orderId: string, newStatus: ServiceOrderStatus) => {
    const result = await updateServiceOrderStatus(orderId, newStatus)

    if (result.success) {
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    }
  }

  const getOrdersByStatus = (status: ServiceOrderStatus) => {
    return orders.filter((order) => order.status === status)
  }

  const getNextStatus = (currentStatus: ServiceOrderStatus): ServiceOrderStatus | null => {
    const currentIndex = KANBAN_COLUMNS.findIndex((col) => col.status === currentStatus)
    if (currentIndex < KANBAN_COLUMNS.length - 1) {
      return KANBAN_COLUMNS[currentIndex + 1].status
    }
    return null
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {KANBAN_COLUMNS.slice(0, -1).map((column) => {
          const columnOrders = getOrdersByStatus(column.status)

          return (
            <div key={column.status} className="w-72 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4 px-2">
                <column.icon className={cn("w-5 h-5", column.color)} />
                <h3 className="font-semibold text-foreground">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {columnOrders.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {columnOrders.length === 0 ? (
                  <div className="p-4 border border-dashed border-border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Nenhuma OS</p>
                  </div>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onMoveNext={() => {
                        const next = getNextStatus(order.status)
                        if (next) handleStatusChange(order.id, next)
                      }}
                      canMoveNext={!!getNextStatus(order.status)}
                      onStatusChange={(status) => handleStatusChange(order.id, status)}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface OrderCardProps {
  order: ServiceOrder
  onMoveNext: () => void
  canMoveNext: boolean
  onStatusChange: (status: ServiceOrderStatus) => void
}

function OrderCard({ order, onMoveNext, canMoveNext, onStatusChange }: OrderCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

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
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">OS #{order.order_number}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href={`/admin/orders/${order.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openWhatsApp} className="cursor-pointer">
                <MessageCircle className="h-4 w-4 mr-2 text-green-500" />
                Enviar WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStatusChange("cancelled")} className="cursor-pointer text-destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar OS
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <div>
          <p className="text-sm font-medium text-foreground">{order.customer?.name || "Cliente"}</p>
          <p className="text-xs text-muted-foreground">
            {order.device_brand} {order.device_model}
          </p>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{order.problem_description}</p>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{formatDate(order.created_at)}</span>
          {order.final_price && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
              R$ {order.final_price.toFixed(2)}
            </Badge>
          )}
        </div>

        {canMoveNext && (
          <Button onClick={onMoveNext} variant="outline" size="sm" className="w-full mt-2 bg-transparent">
            Avançar
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
