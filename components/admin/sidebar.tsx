"use client"

// Moldura do painel no sistema visual da home. No computador, o menu lateral com a marca, as seções e
// quem está usando. No celular, a barra do topo com a marca, as notificações e o perfil, e a barra de
// abas de vidro da Desdobra flutuando embaixo; "Mais" abre as outras seções numa folha.

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import { NotificationDropdown } from "@/components/admin/notification-dropdown"
import { ROLE_LABELS, UserAvatar } from "@/components/admin/avatar"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Profile } from "@/types/database"

const SECTIONS = [
  {
    label: "Atendimento",
    items: [
      { href: "/admin", label: "Início", icon: LayoutGrid },
      { href: "/admin/leads", label: "Pedidos de orçamento", icon: FileText },
      { href: "/admin/orders", label: "Ordens de serviço", icon: ClipboardList },
      { href: "/admin/customers", label: "Clientes", icon: Users },
    ],
  },
  {
    label: "Vendas",
    items: [
      { href: "/admin/pdv", label: "PDV", icon: ShoppingCart },
      { href: "/admin/products", label: "Produtos", icon: Package },
    ],
  },
  {
    label: "Gestão",
    items: [
      { href: "/admin/financial", label: "Financeiro", icon: Wallet },
      { href: "/admin/settings", label: "Configurações", icon: Settings },
    ],
  },
]

/** As abas do celular; o resto fica em "Mais". */
const TABS = [
  { href: "/admin", label: "Início", icon: Home },
  { href: "/admin/orders", label: "OS", icon: ClipboardList },
  { href: "/admin/products", label: "Produtos", icon: Package },
  { href: "/admin/financial", label: "Financeiro", icon: Wallet },
]

const MORE = [
  { href: "/admin/leads", label: "Pedidos de orçamento", note: "Os pedidos que chegam pelo site", icon: FileText },
  { href: "/admin/customers", label: "Clientes", note: "A base de contatos", icon: Users },
  { href: "/admin/pdv", label: "PDV", note: "Frente de caixa", icon: ShoppingCart },
  { href: "/admin/settings", label: "Configurações", note: "Perfil, equipe e cadastros", icon: Settings },
]

export function AdminSidebar({ user }: { user: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [moreOpen, setMoreOpen] = useState(false)

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href))
  const moreActive = MORE.some((item) => isActive(item.href))

  // A folha fecha ao trocar de página e com Esc.
  useEffect(() => setMoreOpen(false), [pathname])
  useEffect(() => {
    if (!moreOpen) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMoreOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [moreOpen])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push("/auth/login")
  }

  return (
    <>
      {/* Computador: menu lateral */}
      <aside className="pwa-safe-header fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-sc-line bg-sc-stage lg:flex">
        <div className="flex h-20 shrink-0 items-center gap-3 px-6">
          <Link href="/admin" className="sc-logo" aria-label="Saymon Cell, início do painel">
            Saymon <b>Cell</b>
            <sup>®</sup>
          </Link>
          <span className="sc-label ml-auto text-sc-smoke">Painel</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Painel">
          {SECTIONS.map((section) => (
            <div key={section.label} className="mt-6 first:mt-2">
              <p className="sc-label px-3 pb-2 text-sc-smoke">{section.label}</p>
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group flex items-center gap-3 rounded-full px-3 py-2.5 text-[14px] font-medium transition-colors",
                          active ? "bg-white/[0.07] text-sc-bone" : "text-sc-stone hover:bg-white/[0.04] hover:text-sc-bone",
                        )}
                      >
                        <item.icon
                          className={cn("size-[18px] shrink-0", active ? "text-sc-red" : "text-sc-smoke group-hover:text-sc-stone")}
                          aria-hidden="true"
                        />
                        {item.label}
                        {active && <span className="ml-auto size-1.5 rounded-full bg-sc-red" aria-hidden="true" />}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="safe-area-bottom shrink-0 border-t border-sc-line p-4">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size={38} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-sc-bone">{user?.full_name || "Usuário"}</p>
              <p className="sc-label truncate text-sc-stone">{ROLE_LABELS[user?.role ?? ""] ?? "Equipe"}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="grid size-9 shrink-0 place-items-center rounded-full text-sc-stone transition-colors hover:bg-sc-raised hover:text-sc-red"
              aria-label="Sair do painel"
              title="Sair"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      {/* Celular: barra do topo */}
      <header className="pwa-safe-header pn-topbar fixed inset-x-0 top-0 z-40 lg:hidden">
        <div className="flex h-16 items-center gap-3 px-4">
          <Link href="/admin" className="sc-logo" aria-label="Saymon Cell, início do painel">
            Saymon <b>Cell</b>
            <sup>®</sup>
          </Link>
          <span className="sc-label text-sc-smoke max-[359px]:hidden">Painel</span>
          <div className="ml-auto flex items-center gap-1.5">
            <NotificationDropdown />
            <Link href="/admin/settings" className="rounded-full" aria-label="Meu perfil e configurações">
              <UserAvatar user={user} size={34} />
            </Link>
          </div>
        </div>
      </header>

      {/* Celular: "Mais" numa folha acima da barra de abas */}
      {moreOpen && (
        <div className="fixed inset-0 z-[38] bg-[rgba(10,9,8,0.72)] backdrop-blur-[6px] lg:hidden" onClick={() => setMoreOpen(false)} />
      )}
      <div id="pn-more" className="pn-more lg:hidden" data-open={moreOpen ? "1" : "0"} aria-hidden={!moreOpen}>
        <p className="sc-label px-3 pb-1 pt-2 text-sc-smoke">Mais seções</p>
        <ul>
          {MORE.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                tabIndex={moreOpen ? 0 : -1}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors hover:bg-white/[0.05] aria-[current=page]:bg-white/[0.07]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sc-raised">
                  <item.icon className="size-[18px] text-sc-bone" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-sc-bone">{item.label}</span>
                  <span className="block truncate text-[13px] text-sc-stone">{item.note}</span>
                </span>
                <ChevronRight className="size-4 text-sc-smoke" aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              tabIndex={moreOpen ? 0 : -1}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition-colors hover:bg-white/[0.05]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sc-raised">
                <LogOut className="size-[18px] text-sc-red" aria-hidden="true" />
              </span>
              <span className="text-[15px] font-medium text-sc-bone">Sair do painel</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Celular: a barra de abas de vidro da Desdobra */}
      <nav className="pn-tabbar-wrap lg:hidden" aria-label="Painel">
        <div className="sc-tabbar pn-tabbar">
          {TABS.map((tab) => (
            <Link key={tab.href} href={tab.href} className="pn-tab" aria-current={isActive(tab.href) && !moreOpen ? "page" : undefined}>
              <tab.icon aria-hidden="true" />
              <span>{tab.label}</span>
            </Link>
          ))}
          <button
            type="button"
            className="pn-tab"
            aria-expanded={moreOpen}
            aria-controls="pn-more"
            aria-current={moreOpen || moreActive ? "true" : undefined}
            onClick={() => setMoreOpen((open) => !open)}
          >
            {moreOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
  )
}
