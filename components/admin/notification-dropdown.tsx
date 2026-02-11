"use client"

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

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  new_lead: {
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  low_stock: {
    icon: Package,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  new_purchase: {
    icon: ShoppingCart,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  order_status: {
    icon: ClipboardList,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  system: {
    icon: Info,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
}

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "Agora"
  if (diffMin < 60) return `${diffMin}min atras`
  if (diffHours < 24) return `${diffHours}h atras`
  if (diffDays < 7) return `${diffDays}d atras`

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
  const config = TYPE_CONFIG[notification.type] || TYPE_CONFIG.system
  const Icon = config.icon

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
      className={cn(
        "w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50",
        !notification.is_read && "bg-primary/5"
      )}
    >
      <div
        className={cn(
          "mt-0.5 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center",
          config.bg
        )}
      >
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "text-sm leading-tight truncate",
              !notification.is_read
                ? "font-semibold text-foreground"
                : "font-medium text-muted-foreground"
            )}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.body}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {formatTimeAgo(notification.created_at)}
        </p>
      </div>
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
        className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 cursor-pointer hover:bg-secondary/50 active:scale-95"
        aria-label="Notificacoes"
      >
        <Bell
          className={cn(
            "w-5 h-5 transition-colors",
            open ? "text-primary" : "text-muted-foreground"
          )}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-[100] w-[360px] max-w-[calc(100vw-2rem)]",
            "bg-card border border-border rounded-xl shadow-xl",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
            // Mobile: centralizar
            "max-lg:fixed max-lg:right-4 max-lg:left-4 max-lg:w-auto max-lg:top-16"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Notificacoes
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
                  {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Banner para ativar push notifications */}
          {showPushBanner && (
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-amber-500/5">
              <BellRing className="w-4 h-4 flex-shrink-0 text-amber-500" />
              <p className="flex-1 text-xs text-muted-foreground leading-snug">
                Receba alertas em tempo real no seu dispositivo.
              </p>
              <button
                type="button"
                onClick={pushSubscribe}
                disabled={pushBusy}
                className="flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                {pushBusy ? "..." : "Ativar"}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto overscroll-contain">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Nenhuma notificacao ainda
                </p>
                <p className="text-xs text-muted-foreground/60 text-center mt-1">
                  Novos leads e alertas de estoque aparecerao aqui
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
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
            <div className="border-t border-border px-4 py-2">
              <p className="text-[10px] text-muted-foreground/50 text-center">
                Mostrando as {notifications.length} notificacoes mais recentes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
