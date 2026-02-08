"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Profile } from "@/types/database"
import { createClient } from "@/lib/supabase/client"

interface AdminHeaderProps {
  user: Profile | null
  title: string
  subtitle?: string
}

export function AdminHeader({ user, title, subtitle }: AdminHeaderProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    const run = async () => {
      if (!user?.avatar_url) {
        setAvatarUrl(null)
        return
      }
      if (user.avatar_url.startsWith("http")) {
        setAvatarUrl(user.avatar_url)
        return
      }
      const supabase = createClient()
      const { data } = await supabase.storage.from("avatar_profire").createSignedUrl(user.avatar_url, 3600)
      setAvatarUrl(data?.signedUrl || null)
    }
    run()
  }, [user?.avatar_url])

  return (
    <header className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9 w-64 bg-background border-input" />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User */}
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={user?.full_name || "Usuário"}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">{user?.full_name?.charAt(0) || "U"}</span>
            </div>
          )}
          <div className="hidden xl:block">
            <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}
