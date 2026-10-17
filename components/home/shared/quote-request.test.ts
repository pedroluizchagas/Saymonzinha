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

  test("na busca e entrega, o endereço vai junto com o pedido", () => {
    const result = checkQuoteRequest({ ...maria, delivery: "delivery", address: " Rua das Flores, 120 " })
    expect(result.ok && result.lead.delivery_address).toBe("Rua das Flores, 120")
  })

  test("na busca e entrega, o endereço é obrigatório", () => {
    const result = checkQuoteRequest({ ...maria, delivery: "delivery", address: "Rua" })
    expect(result.ok ? [] : Object.keys(result.errors)).toEqual(["address"])
  })

  test("o contato precisa de nome e de um WhatsApp com DDD", () => {
    const result = checkQuoteRequest({ ...maria, name: " M ", whatsapp: "98888-777" })
    expect(result.ok ? [] : Object.keys(result.errors).sort()).toEqual(["name", "whatsapp"])
  })

  test("o aparelho precisa de marca e de modelo", () => {
    const result = checkQuoteRequest({ ...maria, brand: "", model: " A " })
    expect(result.ok ? [] : Object.keys(result.errors).sort()).toEqual(["brand", "model"])
  })

  test("o problema precisa ser escolhido", () => {
    const result = checkQuoteRequest({ ...maria, problem: "" })
    expect(result.ok ? [] : Object.keys(result.errors)).toEqual(["problem"])
  })

  test("a descrição opcional vai no pedido quando o cliente preenche", () => {
    const result = checkQuoteRequest({ ...maria, description: " Caiu no chão e a tela apagou. " })
    expect(result.ok && result.lead.problem_description).toBe("Caiu no chão e a tela apagou.")
  })

  test("o link abre o WhatsApp oficial com o pedido escrito", () => {
    const result = checkQuoteRequest({ ...maria, delivery: "delivery" })
    const url = new URL(result.ok ? result.whatsappUrl : "about:blank")
    expect([url.origin + url.pathname, url.searchParams.get("text")]).toEqual([
      "https://wa.me/5537988023341",
      "Olá Saymon Cell! Acabei de enviar um pedido de orçamento pelo site.\n\n" +
        "*Nome:* Maria Souza\n" +
        "*Aparelho:* Samsung Galaxy A15\n" +
        "*Problema:* Troca de Tela\n" +
        "*Entrega:* Quero busca e entrega\n\n" +
        "Aguardo o contato!",
    ])
  })
})
