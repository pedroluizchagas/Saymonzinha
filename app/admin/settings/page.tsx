import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/types/database"
import { ProfileSettings } from "@/components/admin/profile-settings"

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
        subtitle="O seu perfil, a equipe e os cadastros do painel"
      />

      <div className="space-y-6 px-4 pb-6 md:px-8">
        {profile ? <ProfileSettings profile={profile as Profile} /> : null}

        {/* os cadastros do painel, numerados como as listas da home */}
        <section aria-label="Cadastros" className="max-w-5xl">
          <p className="sc-label mb-3 text-sc-stone">Cadastros</p>
          <ul className="overflow-hidden rounded-[20px] border border-sc-line">
            {SECTIONS.map((section, i) => (
              <li key={section.href} className="border-b border-sc-line last:border-0">
                <Link
                  href={section.href}
                  className="group grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-4 bg-sc-carbon px-5 py-4 transition-colors hover:bg-sc-raised"
                >
                  <span className="sc-label text-sc-smoke group-hover:text-sc-red">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="block font-display text-[26px] leading-[0.9] font-black uppercase tracking-[-0.01em] text-sc-bone">
                      {section.title}
                    </span>
                    <span className="mt-1.5 block text-[13px] text-sc-stone">{section.description}</span>
                  </span>
                  <ArrowUpRight className="size-5 text-sc-smoke transition-colors group-hover:text-sc-red" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

const SECTIONS = [
  { title: "Equipe", description: "Quem usa o painel, com qual função, e quem está ativo", href: "/admin/settings/team" },
  { title: "Marcas e modelos", description: "Os aparelhos que a loja atende, para as OS", href: "/admin/settings/devices" },
  { title: "Tipos de serviço", description: "Os consertos e os preços estimados", href: "/admin/settings/services" },
  { title: "Formas de pagamento", description: "Pix, dinheiro, cartões e as taxas de cada um", href: "/admin/settings/payments" },
  { title: "Geral", description: "As preferências da loja", href: "/admin/settings/general" },
]
