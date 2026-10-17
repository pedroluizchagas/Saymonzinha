"use client"

// Notificações do painel no estilo da tela de bloqueio da home: o ícone do app em vermelho quando a
// notificação é nova, o título, o texto e o tempo em mono. O sino abre a lista; o banner oferece os
// alertas no celular.

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Bell,
  BellRing,
  FileText,
  Package,
  ShoppingCart,
  ClipboardList,
  Info,
  CheckCheck,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/hooks/use-notifications"
import { usePushSubscription } from "@/hooks/use-push-subscription"
import type { NotificationWithReadStatus, NotificationType } from "@/types/database"

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  new_lead: FileText,
  low_stock: Package,
  new_purchase: ShoppingCart,
  order_status: ClipboardList,
  system: Info,
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "agora"
  if (diffMin < 60) return `${diffMin} min`
  if (diffHours < 24) return `${diffHours} h`
  if (diffDays < 7) return `${diffDays} d`

  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: NotificationWithReadStatus
  onRead: (id: string) => void
  onNavigate: (url: string) => void
}) {
  const Icon = TYPE_ICON[notification.type] || TYPE_ICON.system

  const handleClick = () => {
    if (!notification.is_read) {
      onRead(notification.id)
    }
    onNavigate(notification.url)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="grid w-full grid-cols-[38px_minmax(0,1fr)_auto] items-start gap-3 rounded-[18px] px-3 py-3 text-left transition-colors hover:bg-white/[0.05]"
    >
      <span
        className={cn(
          "grid size-[38px] place-items-center rounded-[10px]",
          notification.is_read ? "bg-sc-raised text-sc-stone" : "bg-sc-red text-white"
        )}
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block truncate text-[13px] leading-[1.3]",
            notification.is_read ? "font-medium text-sc-stone" : "font-semibold text-sc-bone"
          )}
        >
          {notification.title}
        </span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-[1.35] text-sc-stone">{notification.body}</span>
      </span>
      <span className="sc-label flex items-center gap-1.5 pt-0.5 text-sc-smoke">
        {!notification.is_read && <span className="size-1.5 rounded-full bg-sc-red" aria-label="nova" />}
        {formatTimeAgo(notification.created_at)}
      </span>
    </button>
  )
}

interface NotificationDropdownProps {
  className?: string
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications()
  const { status: pushStatus, busy: pushBusy, subscribe: pushSubscribe } =
    usePushSubscription()

  // Banner so aparece quando o usuario pode tomar acao (ativar push).
  // Se "denied", nao ha o que fazer de dentro do app.
  const showPushBanner =
    pushStatus === "prompt" || pushStatus === "unsubscribed"

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])

  // Fechar com Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [open])

  const handleNavigate = (url: string) => {
    setOpen(false)
    router.push(url)
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Trigger - Sininho */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "relative grid size-10 place-items-center rounded-full transition-colors active:scale-95",
          open ? "bg-sc-bone text-sc-ink" : "bg-sc-raised text-sc-bone hover:bg-white/[0.12]"
        )}
        aria-label={unreadCount > 0 ? `Notificações, ${unreadCount} novas` : "Notificações"}
        aria-expanded={open}
      >
        <Bell className="size-[18px]" aria-hidden="true" />
        {unreadCount > 0 && (
          <span aria-hidden="true" className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-sc-red-strong px-1 text-[11px] font-bold leading-none text-white ring-2 ring-sc-stage">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-[100] w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden",
            "rounded-[20px] border border-sc-line bg-sc-carbon shadow-[0_50px_90px_-40px_rgba(0,0,0,0.75),0_30px_60px_-30px_rgba(0,0,0,0.5)]",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
            // Celular: abaixo da barra do topo, de ponta a ponta
            "max-lg:fixed max-lg:right-3 max-lg:left-3 max-lg:w-auto max-lg:top-[calc(4rem+var(--sat)+6px)]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-sc-line px-4 py-3.5">
            <p className="sc-label whitespace-nowrap text-sc-bone">
              Notificações
              {unreadCount > 0 && <span className="text-sc-red"> · {unreadCount}</span>}
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[13px] text-sc-stone transition-colors hover:bg-white/[0.05] hover:text-sc-bone"
              >
                <CheckCheck className="size-3.5" aria-hidden="true" />
                Marcar como lidas
              </button>
            )}
          </div>

          {/* Banner para ativar push notifications */}
          {showPushBanner && (
            <div className="flex items-center gap-3 border-b border-sc-line px-4 py-3">
              <BellRing className="size-4 shrink-0 text-sc-red" aria-hidden="true" />
              <p className="flex-1 text-[13px] leading-snug text-sc-stone">Receba os alertas no celular, na hora.</p>
              <button
                type="button"
                onClick={pushSubscribe}
                disabled={pushBusy}
                className="sc-pill sc-pill--red sc-pill--sm shrink-0 disabled:opacity-60"
              >
                {pushBusy ? "Ativando" : "Ativar"}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto overscroll-contain p-1.5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="size-5 animate-spin text-sc-stone" aria-label="Carregando" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                <span className="mb-3 grid size-12 place-items-center rounded-full bg-sc-raised">
                  <Bell className="size-5 text-sc-stone" aria-hidden="true" />
                </span>
                <p className="text-sm text-sc-bone">Nenhuma notificação ainda</p>
                <p className="mt-1 text-[13px] text-sc-stone">
                  Os pedidos de orçamento novos e os alertas de estoque aparecem aqui.
                </p>
              </div>
            ) : (
              <div className="grid gap-0.5">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={markAsRead}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <p className="sc-label border-t border-sc-line px-4 py-2.5 text-center text-sc-smoke">
              As {notifications.length} mais recentes
            </p>
          )}
        </div>
      )}
    </div>
  )
}
