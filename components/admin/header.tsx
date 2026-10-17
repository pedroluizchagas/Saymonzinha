"use client"

// Cabeçalho de cada página do painel: o rótulo em mono e o título no display da home, como as seções
// da Raio-X, e as ações da página (Nova OS, Novo cliente...). No computador, as notificações e quem
// está usando ficam à direita; no celular elas já estão na barra do topo.

import type { ReactNode } from "react"
import { NotificationDropdown } from "@/components/admin/notification-dropdown"
import { ROLE_LABELS, UserAvatar } from "@/components/admin/avatar"
import type { Profile } from "@/types/database"

interface AdminHeaderProps {
  user: Profile | null
  title: string
  subtitle?: string
  /** Ações da página, à direita do título no computador e abaixo dele no celular. */
  children?: ReactNode
}

export function AdminHeader({ user, title, subtitle, children }: AdminHeaderProps) {
  return (
    <header className="flex flex-wrap items-end gap-x-6 gap-y-4 px-4 pt-5 pb-5 md:px-8 lg:pt-8 lg:pb-7">
      <div className="min-w-0 flex-1">
        {subtitle && <p className="sc-label text-sc-stone">{subtitle}</p>}
        <h1 className="mt-2.5 font-display text-[clamp(40px,5vw,64px)] leading-[0.84] font-black uppercase tracking-[-0.01em] text-balance text-sc-bone lg:mt-3">
          {title}
        </h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 max-lg:w-full">{children}</div>}
      <div className="hidden items-center gap-3 border-l border-sc-line pl-4 lg:flex">
        <NotificationDropdown />
        <UserAvatar user={user} size={38} />
        <div className="hidden xl:block">
          <p className="text-sm font-medium text-sc-bone">{user?.full_name}</p>
          <p className="sc-label text-sc-stone">{ROLE_LABELS[user?.role ?? ""] ?? "Equipe"}</p>
        </div>
      </div>
    </header>
  )
}
