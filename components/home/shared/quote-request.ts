// Pedido de orçamento feito pela janela da home nova (ver GLOSSARY.md): valida o que o cliente
// preencheu e prepara o pedido que vai para o painel. A senha do aparelho não é pedida pelo site;
// a equipe preenche na ordem de serviço.

import type { CreateLeadDTO, DeliveryType } from "@/types/database"
import { BRANDS, whatsappLink } from "./content"

export const DEVICE_BRANDS = [...BRANDS, "Outro"]

// Os mesmos problemas do formulário da home atual, mais o banho químico, que é um serviço da loja.
export const PROBLEM_TYPES = [
  "Troca de Tela",
  "Substituição de Bateria",
  "Troca de Conector de Carga",
  "Reparo de Placa",
  "Banho Químico",
  "Troca de Alto-falante",
  "Troca de Câmera",
  "Troca de Microfone",
  "Formatação",
  "Remoção de Conta Google",
  "Troca de Botões",
  "Reparo de TouchID/FaceID",
  "Outros Reparos",
]

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

/** Os passos da janela do pedido e os campos de cada um, na ordem em que aparecem. */
export const QUOTE_REQUEST_STEPS: { title: string; fields: (keyof QuoteRequestForm)[] }[] = [
  { title: "Como falamos com você?", fields: ["name", "whatsapp"] },
  { title: "Qual é o aparelho?", fields: ["brand", "model"] },
  { title: "O que aconteceu?", fields: ["problem", "description"] },
  { title: "Como o aparelho chega até nós?", fields: ["delivery", "address"] },
]

export type QuoteRequestErrors = Partial<Record<keyof QuoteRequestForm, string>>

export type QuoteRequestCheck =
  | { ok: false; errors: QuoteRequestErrors }
  | { ok: true; lead: CreateLeadDTO; whatsappUrl: string }

export function checkQuoteRequest(form: QuoteRequestForm): QuoteRequestCheck {
  const errors: QuoteRequestErrors = {}
  if (form.name.trim().length < 2) errors.name = "Informe seu nome."
  if (form.whatsapp.replace(/\D/g, "").length < 10) errors.whatsapp = "Informe o WhatsApp com DDD."
  if (!form.brand) errors.brand = "Escolha a marca."
  if (form.model.trim().length < 2) errors.model = "Informe o modelo do aparelho."
  if (!form.problem) errors.problem = "Escolha o problema."
  if (form.delivery === "delivery" && form.address.trim().length < 5) errors.address = "Informe o endereço para a busca."
  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const lead: CreateLeadDTO = {
    customer_name: form.name.trim(),
    customer_phone: form.whatsapp.replace(/\D/g, ""),
    device_brand: form.brand,
    device_model: form.model.trim(),
    problem_type: form.problem,
    delivery_type: form.delivery,
  }
  if (form.description.trim()) lead.problem_description = form.description.trim()
  if (form.delivery === "delivery") lead.delivery_address = form.address.trim()

  // A mesma mensagem do formulário da home atual, com os nomes do glossário.
  const message =
    "Olá Saymon Cell! Acabei de enviar um pedido de orçamento pelo site.\n\n" +
    `*Nome:* ${lead.customer_name}\n` +
    `*Aparelho:* ${lead.device_brand} ${lead.device_model}\n` +
    `*Problema:* ${lead.problem_type}\n` +
    `*Entrega:* ${lead.delivery_type === "store" ? "Vou levar na loja" : "Quero busca e entrega"}\n\n` +
    "Aguardo o contato!"

  return { ok: true, lead, whatsappUrl: whatsappLink(message) }
}
