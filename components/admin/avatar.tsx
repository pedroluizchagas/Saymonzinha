"use client"

// Foto do perfil de quem usa o painel, ou a inicial num círculo vermelho, como o avatar da chamada
// recebida da home. A foto guardada no Supabase precisa de um endereço assinado.

import Image from "next/image"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Profile } from "@/types/database"

export const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  technician: "Técnico",
  attendant: "Atendente",
}

function useAvatarUrl(path: string | null | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!path) {
      setUrl(null)
      return
    }
    if (path.startsWith("http")) {
      setUrl(path)
      return
    }
    let active = true
    createClient()
      .storage.from("avatar_profire")
      .createSignedUrl(path, 3600)
      .then(({ data }) => active && setUrl(data?.signedUrl || null))
    return () => {
      active = false
    }
  }, [path])
  return url
}

export function UserAvatar({ user, size = 36, className }: { user: Profile | null; size?: number; className?: string }) {
  const url = useAvatarUrl(user?.avatar_url)
  const name = user?.full_name || "Usuário"
  return url ? (
    <Image
      src={url}
      alt={name}
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn("grid shrink-0 place-items-center rounded-full bg-sc-red-strong font-display font-black text-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
