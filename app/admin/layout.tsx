import type React from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'
import type { Profile } from '@/types/database'
import { SWRegister } from '@/components/pwa/sw-register'
import { InstallPrompt } from '@/components/pwa/install-prompt'

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Saymon Cell Admin',
  },
  manifest: '/manifest.webmanifest',
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
    <div className="min-h-screen-safe bg-background">
      <AdminSidebar user={profile as Profile | null} />
      <main className="lg:ml-64 main-content-offset min-h-screen-safe safe-area-bottom safe-area-x">
        {children}
      </main>
      <SWRegister />
      <InstallPrompt />
    </div>
  )
}
