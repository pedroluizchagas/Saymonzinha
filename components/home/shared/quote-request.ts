// Pedido de orçamento feito pela janela da home nova (ver GLOSSARY.md): valida o que o cliente
// preencheu e prepara o pedido que vai para o painel. A senha do aparelho não é pedida pelo site;
// a equipe preenche na ordem de serviço.

import type { CreateLeadDTO, DeliveryType } from "@/types/database"

export type QuoteRequestForm = {
  name: string
  whatsapp: string
  brand: string
  model: string
  problem: string
  description: string
  delivery: DeliveryType
  address: string
}

export const EMPTY_QUOTE_REQUEST: QuoteRequestForm = {
  name: "",
  whatsapp: "",
  brand: "",
  model: "",
  problem: "",
  description: "",
  delivery: "store",
  address: "",
}

export type QuoteRequestCheck = { ok: true; lead: CreateLeadDTO }

export function checkQuoteRequest(form: QuoteRequestForm): QuoteRequestCheck {
  return {
    ok: true,
    lead: {
      customer_name: form.name.trim(),
      customer_phone: form.whatsapp.replace(/\D/g, ""),
      device_brand: form.brand,
      device_model: form.model.trim(),
      problem_type: form.problem,
      delivery_type: form.delivery,
    },
  }
}
