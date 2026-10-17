import { describe, expect, test } from "vitest"
import { EMPTY_QUOTE_REQUEST, checkQuoteRequest, type QuoteRequestForm } from "./quote-request"

const maria: QuoteRequestForm = {
  ...EMPTY_QUOTE_REQUEST,
  name: "  Maria Souza ",
  whatsapp: "(37) 98888-7777",
  brand: "Samsung",
  model: " Galaxy A15 ",
  problem: "Troca de Tela",
  delivery: "store",
  address: "Rua das Flores, 120",
}

describe("pedido de orçamento", () => {
  test("um pedido completo fica pronto para salvar no painel", () => {
    const result = checkQuoteRequest(maria)
    expect(result.ok && result.lead).toStrictEqual({
      customer_name: "Maria Souza",
      customer_phone: "37988887777",
      device_brand: "Samsung",
      device_model: "Galaxy A15",
      problem_type: "Troca de Tela",
      delivery_type: "store",
    })
  })
})
