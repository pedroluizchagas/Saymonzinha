'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Phone,
  MessageCircle,
  XCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react'
import type { Lead, LeadStatus } from '@/types/database'

interface LeadsTableProps {
  leads: Lead[]
}

// A situação de cada pedido pela claridade, não pela cor: o que espera contato em vermelho, o que
// virou OS em osso, o que foi contatado em pedra e o rejeitado apagado.
const STATUS_CONFIG: Record<LeadStatus, { label: string; dot: string; text: string }> = {
  pending: { label: 'Aguardando contato', dot: 'bg-sc-red', text: 'text-sc-red' },
  contacted: { label: 'Contatado', dot: 'bg-sc-stone', text: 'text-sc-stone' },
  converted: { label: 'Virou OS', dot: 'bg-sc-bone', text: 'text-sc-bone' },
  rejected: { label: 'Rejeitado', dot: 'bg-sc-smoke', text: 'text-sc-smoke line-through' },
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const router = useRouter()

  const updateLeadStatus = async (leadId: string, status: LeadStatus) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)

    if (!error) {
      setLeads(
        leads.map((lead) => (lead.id === leadId ? { ...lead, status } : lead)),
      )
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '')
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
    }
    return phone
  }

  const openWhatsApp = (phone: string, name: string) => {
    const message = encodeURIComponent(
      `Olá ${name}! Sou da Saymon Cell e recebi seu pedido de orçamento. Vamos conversar sobre o reparo do seu aparelho?`,
    )
    window.open(
      `https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`,
      '_blank',
    )
  }

  const pendingCount = leads.filter((l) => l.status === 'pending').length

  return (
    <Card>
      <CardHeader>
        <p className="sc-label text-sc-stone">Pelo site</p>
        <CardTitle>{leads.length === 1 ? '1 pedido recebido' : `${leads.length} pedidos recebidos`}</CardTitle>
        {pendingCount > 0 && (
          <p className="flex items-center gap-1.5 text-sm text-sc-red">
            <span className="size-1.5 rounded-full bg-sc-red" aria-hidden="true" />
            {pendingCount === 1 ? '1 esperando contato' : `${pendingCount} esperando contato`}
          </p>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:px-3">
        {leads.length === 0 ? (
          <div className="px-3 py-12 text-center">
            <Clock className="mx-auto mb-4 size-10 text-sc-smoke" aria-hidden="true" />
            <p className="text-sc-bone">Nenhum pedido de orçamento recebido ainda</p>
            <p className="mt-1 text-sm text-sc-stone">Os pedidos que chegam pelo site aparecem aqui.</p>
          </div>
        ) : (
          <>
            {/* cabeçalho das colunas, só no computador */}
            <div className="sc-label hidden grid-cols-[150px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px_96px] gap-4 border-b border-sc-line px-3 pb-3 text-sc-stone lg:grid">
              <span>Situação</span>
              <span>Cliente</span>
              <span>Aparelho</span>
              <span>Problema</span>
              <span>Data</span>
              <span className="text-right">Ações</span>
            </div>
            <ul className="divide-y divide-sc-line">
              {leads.map((lead) => {
                const status = STATUS_CONFIG[lead.status]
                return (
                  <li
                    key={lead.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 rounded-[14px] px-3 py-4 transition-colors hover:bg-white/[0.03] lg:grid-cols-[150px_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.4fr)_120px_96px] lg:items-center lg:gap-y-0"
                  >
                    <span className={`sc-label flex items-center gap-1.5 ${status.text}`}>
                      <span className={`size-1.5 shrink-0 rounded-full ${status.dot}`} aria-hidden="true" />
                      {status.label}
                    </span>
                    <span className="sc-label text-right text-sc-smoke lg:hidden">{formatDate(lead.created_at)}</span>
                    <div className="col-span-2 min-w-0 lg:col-span-1">
                      <p className="truncate font-semibold text-sc-bone">{lead.customer_name}</p>
                      <p className="text-sm tabular-nums text-sc-stone">{formatPhone(lead.customer_phone)}</p>
                    </div>
                    <p className="sc-label col-span-2 truncate text-sc-stone lg:col-span-1 lg:text-sc-bone">
                      {lead.device_brand} {lead.device_model}
                    </p>
                    <div className="col-span-2 min-w-0 lg:col-span-1">
                      <p className="text-sm text-sc-bone">{lead.problem_type}</p>
                      {lead.problem_description && <p className="truncate text-[13px] text-sc-stone">{lead.problem_description}</p>}
                      <p className="sc-label mt-1 text-sc-smoke">{lead.delivery_type === 'store' ? 'Na loja' : 'Busca e entrega'}</p>
                    </div>
                    <span className="sc-label hidden text-sc-stone lg:block">{formatDate(lead.created_at)}</span>
                    <div className="col-span-2 flex items-center gap-1.5 pt-1 lg:col-span-1 lg:justify-end lg:pt-0">
                      <Button
                        size="sm"
                        className="bg-sc-green text-sc-ink lg:size-8 lg:p-0"
                        onClick={() => openWhatsApp(lead.customer_phone, lead.customer_name)}
                        aria-label={`Chamar ${lead.customer_name} no WhatsApp`}
                      >
                        <MessageCircle className="size-4" />
                        <span className="lg:hidden">WhatsApp</span>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label={`Mais ações para ${lead.customer_name}`}>
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateLeadStatus(lead.id, 'contacted')} className="cursor-pointer">
                            <Phone className="size-4" />
                            Marcar como contatado
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/admin/orders/new?lead=${lead.id}`)} className="cursor-pointer">
                            <ArrowUpRight className="size-4" />
                            Abrir uma OS
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => updateLeadStatus(lead.id, 'rejected')} className="cursor-pointer">
                            <XCircle className="size-4" />
                            Rejeitar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  )
}
