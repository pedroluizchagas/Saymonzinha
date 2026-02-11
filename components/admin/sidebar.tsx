"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Settings,
  LogOut,
  Smartphone,
  Menu,
  FileText,
  Home,
  ChevronRight,
} from "lucide-react"
import { useState, useEffect } from "react"
import type { Profile } from "@/types/database"
import { NotificationManager } from "@/components/pwa/notification-manager"
import { NotificationDropdown } from "@/components/admin/notification-dropdown"

interface SidebarProps {
  user: Profile | null
}

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads/Orçamentos", icon: FileText },
  { href: "/admin/orders", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/admin/customers", label: "Clientes", icon: Users },
  { href: "/admin/pdv", label: "PDV", icon: ShoppingCart },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/financial", label: "Financeiro", icon: DollarSign },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
]

export function AdminSidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  // Buscar URL do avatar do usuario
  useEffect(() => {
    const loadAvatar = async () => {
      if (!user?.avatar_url) {
        setAvatarUrl(null)
        return
      }
      if (user.avatar_url.startsWith("http")) {
        setAvatarUrl(user.avatar_url)
        return
      }
      const supabase = createClient()
      const { data } = await supabase.storage
        .from("avatar_profire")
        .createSignedUrl(user.avatar_url, 3600)
      setAvatarUrl(data?.signedUrl || null)
    }
    loadAvatar()
  }, [user?.avatar_url])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile Header - identico ao design */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b border-border z-[60] pwa-safe-header">
        <div className="h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">
              SAYMON <span className="text-primary">CELL</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <NotificationManager />
            <Link
              href="/admin/settings"
              className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={user?.full_name || "Usuario"}
                  width={32}
                  height={32}
                  className="rounded-full object-cover w-8 h-8"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-amber-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs">
                    {user?.full_name?.charAt(0) || "U"}
                  </span>
                </div>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-background/80 z-40" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - flexbox para layout correto com safe areas */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-50 transition-transform duration-300",
          "flex flex-col pwa-safe-header",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="h-16 shrink-0 flex items-center gap-2 px-6 border-b border-border">
          <Smartphone className="w-7 h-7 text-primary" />
          <span className="font-bold text-lg text-foreground">
            SAYMON <span className="text-primary">CELL</span>
          </span>
        </div>

        {/* Navigation - preenche espaco disponivel e rola se necessario */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Section - fixo no rodape com safe area bottom */}
        <div className="shrink-0 p-4 border-t border-border bg-card safe-area-bottom">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold">{user?.full_name?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user?.full_name || "Usuario"}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role || "tecnico"}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay escuro do popup Mais - Mobile */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-[45]"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* Bottom Sheet popup do Mais - Mobile */}
      <div
        className={cn(
          "lg:hidden fixed left-0 right-0 z-50 transition-transform duration-300 ease-out",
          moreOpen ? "translate-y-0" : "translate-y-full",
        )}
        style={{ bottom: "4rem" }}
      >
        <div className="bg-card rounded-t-2xl border-t border-x border-border overflow-hidden">
          {/* Leads */}
          <Link
            href="/admin/leads"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Leads</p>
              <p className="text-xs text-muted-foreground">Gerenciar oportunidades</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
          </Link>

          <div className="h-px bg-border mx-5" />

          {/* Clientes */}
          <Link
            href="/admin/customers"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/15 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Clientes</p>
              <p className="text-xs text-muted-foreground">Base de contatos</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
          </Link>

          <div className="h-px bg-border mx-5" />

          {/* PDV */}
          <Link
            href="/admin/pdv"
            onClick={() => setMoreOpen(false)}
            className="flex items-center gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">PDV</p>
              <p className="text-xs text-muted-foreground">Frente de caixa</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
          </Link>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-[60] bottom-nav-extend pwa-safe-bottom safe-area-x">
        <nav className="h-16 grid grid-cols-5">
          {/* Inicio */}
          <Link
            href="/admin"
            onClick={() => setMoreOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              isActive("/admin") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Home className="w-5 h-5" />
            <span>Inicio</span>
            <span
              className={cn(
                "mt-1 h-0.5 w-6 rounded-full",
                isActive("/admin") ? "bg-primary" : "bg-transparent",
              )}
            />
          </Link>

          {/* OS */}
          <Link
            href="/admin/orders"
            onClick={() => setMoreOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              isActive("/admin/orders") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <ClipboardList className="w-5 h-5" />
            <span>OS</span>
            <span
              className={cn(
                "mt-1 h-0.5 w-6 rounded-full",
                isActive("/admin/orders") ? "bg-primary" : "bg-transparent",
              )}
            />
          </Link>

          {/* Produtos */}
          <Link
            href="/admin/products"
            onClick={() => setMoreOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              isActive("/admin/products") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Package className="w-5 h-5" />
            <span>Produtos</span>
            <span
              className={cn(
                "mt-1 h-0.5 w-6 rounded-full",
                isActive("/admin/products") ? "bg-primary" : "bg-transparent",
              )}
            />
          </Link>

          {/* Financeiro */}
          <Link
            href="/admin/financial"
            onClick={() => setMoreOpen(false)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              isActive("/admin/financial") ? "text-primary" : "text-muted-foreground",
            )}
          >
            <DollarSign className="w-5 h-5" />
            <span>Financeiro</span>
            <span
              className={cn(
                "mt-1 h-0.5 w-6 rounded-full",
                isActive("/admin/financial") ? "bg-primary" : "bg-transparent",
              )}
            />
          </Link>

          {/* Mais */}
          <button
            type="button"
            onClick={() => setMoreOpen(!moreOpen)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 text-xs",
              moreOpen ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Menu className="w-5 h-5" />
            <span>Mais</span>
            <span
              className={cn(
                "mt-1 h-0.5 w-6 rounded-full",
                moreOpen ? "bg-primary" : "bg-transparent",
              )}
            />
          </button>
        </nav>
      </div>
    </>
  )
}
