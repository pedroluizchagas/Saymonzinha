import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

  return (
    <div>
      <AdminHeader user={profile as Profile | null} title="Clientes" subtitle="Gerencie sua base de clientes" />

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/admin/customers/new">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Link>
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            {!customers || customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Nome</TableHead>
                    <TableHead className="text-muted-foreground">Telefone</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(customers as Customer[]).map((customer) => (
                    <TableRow key={customer.id} className="border-border">
                      <TableCell className="font-medium text-foreground">{customer.name}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{customer.email || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
