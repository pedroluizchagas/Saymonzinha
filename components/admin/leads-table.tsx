"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Phone, MessageCircle, XCircle, Clock, ArrowUpRight } from "lucide-react"
import type { Lead, LeadStatus } from "@/types/database"

interface LeadsTableProps {
  leads: Lead[]
}

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  contacted: { label: "Contatado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  converted: { label: "Convertido", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  rejected: { label: "Rejeitado", color: "bg-red-500/10 text-red-500 border-red-500/20" },
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const router = useRouter()

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    const supabase = createClient()

    const { error } = await supabase.from("leads").update({ status }).eq("id", leadId)

    if (!error) {
      setLeads(leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)))
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    return phone
  }

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Olá ${name}! Sou da Saymon Cell e recebi seu pedido de orçamento. Vamos conversar sobre o reparo do seu aparelho?`,
    )
    window.open(`https://wa.me/55${phone.replace(/\D/g, "")}?text=${message}`, "_blank")
  }

  const pendingCount = leads.filter((l) => l.status === "pending").length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg text-foreground">Leads Recebidos</CardTitle>
          {pendingCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {pendingCount} {pendingCount === 1 ? "novo lead" : "novos leads"} aguardando contato
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum lead recebido ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Os pré-orçamentos do site aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Cliente</TableHead>
                  <TableHead className="text-muted-foreground">Aparelho</TableHead>
                  <TableHead className="text-muted-foreground">Problema</TableHead>
                  <TableHead className="text-muted-foreground">Entrega</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Data</TableHead>
                  <TableHead className="text-muted-foreground w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id} className="border-border">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{lead.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{formatPhone(lead.customer_phone)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{lead.device_brand}</p>
                      <p className="text-sm text-muted-foreground">{lead.device_model}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-foreground">{lead.problem_type}</p>
                      {lead.problem_description && (
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {lead.problem_description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-secondary/50">
                        {lead.delivery_type === "store" ? "Na loja" : "Delivery"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_CONFIG[lead.status].color}>{STATUS_CONFIG[lead.status].label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(lead.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openWhatsApp(lead.customer_phone, lead.customer_name)}
                        >
                          <MessageCircle className="h-4 w-4 text-green-500" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem
                              onClick={() => updateLeadStatus(lead.id, "contacted")}
                              className="cursor-pointer"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Marcar como Contatado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/admin/orders/new?lead=${lead.id}`)}
                              className="cursor-pointer"
                            >
                              <ArrowUpRight className="h-4 w-4 mr-2" />
                              Converter em OS
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateLeadStatus(lead.id, "rejected")}
                              className="cursor-pointer text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rejeitar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
