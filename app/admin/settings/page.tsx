import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Users, Smartphone, CreditCard, Tag } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/types/database"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div>
      <AdminHeader
        user={profile as Profile | null}
        title="Configurações"
        subtitle="Gerencie as configurações do sistema"
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl">
          <SettingsCard
            icon={Users}
            title="Equipe"
            description="Gerencie os usuários e permissões do sistema"
            href="/admin/settings/team"
          />
          <SettingsCard
            icon={Smartphone}
            title="Marcas e Modelos"
            description="Configure as marcas e modelos de dispositivos"
            href="/admin/settings/devices"
          />
          <SettingsCard
            icon={Tag}
            title="Tipos de Serviço"
            description="Gerencie os tipos de problemas e preços"
            href="/admin/settings/services"
          />
          <SettingsCard
            icon={CreditCard}
            title="Formas de Pagamento"
            description="Configure métodos de pagamento e taxas"
            href="/admin/settings/payments"
          />
          <SettingsCard
            icon={Settings}
            title="Geral"
            description="Configurações gerais do sistema"
            href="/admin/settings/general"
          />
        </div>
      </div>
    </div>
  )
}

interface SettingsCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
}

function SettingsCard({ icon: Icon, title, description, href }: SettingsCardProps) {
  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <CardTitle className="text-lg text-foreground">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-muted-foreground mb-4">{description}</CardDescription>
        <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
          <Link href={href}>Configurar</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
