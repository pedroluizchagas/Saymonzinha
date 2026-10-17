import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import Link from "next/link"
import type { Profile, Customer } from "@/types/database"

export default async function CustomersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: customers } = await supabase.from("customers").select("*").order("created_at", { ascending: false })

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR")
  }

  const list = (customers as Customer[] | null) ?? []

  return (
    <div>
      <AdminHeader user={profile as Profile | null} title="Clientes" subtitle="A base de contatos da loja">
        <Button asChild>
          <Link href="/admin/customers/new">
            <Plus aria-hidden="true" />
            Novo cliente
          </Link>
        </Button>
      </AdminHeader>

      <div className="px-4 pb-6 md:px-8">
        <Card>
          <CardHeader>
            <p className="sc-label text-sc-stone">Cadastrados</p>
            <CardTitle>{list.length === 1 ? "1 cliente" : `${list.length} clientes`}</CardTitle>
          </CardHeader>
          <CardContent className="px-2 sm:px-3">
            {list.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto mb-4 size-10 text-sc-smoke" aria-hidden="true" />
                <p className="text-sc-stone">Nenhum cliente cadastrado ainda</p>
              </div>
            ) : (
              <>
                <div className="sc-label hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_110px] gap-4 border-b border-sc-line px-3 pb-3 text-sc-stone md:grid">
                  <span>Nome</span>
                  <span>Telefone</span>
                  <span>E-mail</span>
                  <span className="text-right">Cadastro</span>
                </div>
                <ul className="divide-y divide-sc-line">
                  {list.map((customer) => (
                    <li
                      key={customer.id}
                      className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5 px-3 py-3.5 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1.2fr)_110px] md:gap-4"
                    >
                      <span className="row-span-2 grid size-10 place-items-center rounded-full bg-sc-raised font-display text-lg font-black text-sc-bone md:hidden">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="hidden size-9 shrink-0 place-items-center rounded-full bg-sc-raised font-display text-base font-black text-sc-bone md:grid">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate font-medium text-sc-bone">{customer.name}</span>
                      </span>
                      <span className="sc-label row-span-2 self-center text-right text-sc-smoke md:hidden">{formatDate(customer.created_at)}</span>
                      <span className="truncate text-sm tabular-nums text-sc-stone">
                        {customer.phone}
                        <span className="md:hidden">{customer.email ? ` · ${customer.email}` : ""}</span>
                      </span>
                      <span className="hidden truncate text-sm text-sc-stone md:block">{customer.email || "—"}</span>
                      <span className="sc-label hidden text-right text-sc-smoke md:block">{formatDate(customer.created_at)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
