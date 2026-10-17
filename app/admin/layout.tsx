import type React from 'react'
import type { Metadata, Viewport } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import type { Profile } from '@/types/database'
import { SWRegister } from '@/components/pwa/sw-register'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { APPLE_WEB_APP, PWA_THEME_COLOR } from '@/lib/pwa'
import '@/components/admin/painel.css'

export const metadata: Metadata = {
  title: 'Painel | Saymon Cell',
  appleWebApp: APPLE_WEB_APP,
  manifest: '/manifest.webmanifest',
}

// A barra do navegador e a do app instalado ficam no preto do palco, como o painel.
export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen-safe bg-sc-stage">
      <AdminSidebar user={profile as Profile | null} />
      <main className="lg:ml-64 main-content-offset main-content-bottom min-h-screen-safe safe-area-x">
        {children}
      </main>
      <SWRegister />
      <InstallPrompt />
    </div>
  )
}
