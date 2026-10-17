"use client"

// Janela do pedido de orçamento (ver GLOSSARY.md): abre por cima da página a partir de qualquer
// "Pedir orçamento" das duas versões. Na Raio-X sobe de baixo; na Desdobra aparece centralizada.
// Salva o pedido no painel e abre o WhatsApp com a mensagem pronta, como o formulário da home atual.

import { ArrowLeft, ArrowRight, ArrowUpRight, Check, X } from "lucide-react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import { createLead } from "@/lib/actions/lead-actions"
import { ADDRESS } from "./content"
import {
  DEVICE_BRANDS,
  EMPTY_QUOTE_REQUEST,
  PROBLEM_TYPES,
  QUOTE_REQUEST_STEPS,
  checkQuoteRequest,
  type QuoteRequestErrors,
  type QuoteRequestForm,
} from "./quote-request"
import "../sc-system.css"
import "./quote-dialog.css"

type QuoteRequest = {
  /** Abre a janela; `problem` já deixa o problema escolhido (botão de um serviço). */
  open: (problem?: string) => void
}

const QuoteRequestContext = createContext<QuoteRequest | null>(null)

export function useQuoteRequest() {
  const value = useContext(QuoteRequestContext)
  if (!value) throw new Error("useQuoteRequest precisa estar dentro de QuoteRequestProvider")
  return value
}

type Status = "editing" | "sending" | "sent" | "failed"

const LAST_STEP = QUOTE_REQUEST_STEPS.length - 1

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function onlyFields(errors: QuoteRequestErrors, fields: (keyof QuoteRequestForm)[]) {
  return Object.fromEntries(fields.filter((f) => errors[f]).map((f) => [f, errors[f]])) as QuoteRequestErrors
}

export function QuoteRequestProvider({ layout, children }: { layout: "sheet" | "center"; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)
  const id = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_QUOTE_REQUEST)
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<QuoteRequestErrors>({})
  const [status, setStatus] = useState<Status>("editing")
  const [whatsappUrl, setWhatsappUrl] = useState("")
  // Muda a cada tentativa de avançar com erro, para o foco ir ao primeiro campo errado.
  const [focusRequest, setFocusRequest] = useState(0)
  const sent = status === "sent"

  const open = useCallback(
    (problem?: string) => {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      // Depois de um pedido enviado, a próxima abertura começa um pedido novo.
      if (status === "sent") {
        setForm(EMPTY_QUOTE_REQUEST)
        setStep(0)
        setStatus("editing")
      }
      if (problem) setForm((f) => ({ ...f, problem }))
      setErrors({})
      dialogRef.current?.showModal()
      setIsOpen(true)
    },
    [status],
  )
  const api = useMemo(() => ({ open }), [open])

  // Leva o foco ao primeiro campo com erro ou ao primeiro campo do passo. Só ao abrir, ao trocar
  // de passo, ao tentar avançar com erro e ao concluir; nunca enquanto a pessoa digita.
  useEffect(() => {
    if (!isOpen) return
    const body = bodyRef.current
    const target =
      body?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
      body?.querySelector<HTMLElement>("input, select, textarea, a[href]")
    target?.focus()
  }, [isOpen, step, focusRequest, sent])

  const close = () => dialogRef.current?.close()
  const onClose = () => {
    setIsOpen(false)
    openerRef.current?.focus()
  }

  const update = <K extends keyof QuoteRequestForm>(field: K, value: QuoteRequestForm[K]) => {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e))
    if (status === "failed") setStatus("editing")
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const check = checkQuoteRequest(form)
    if (step < LAST_STEP) {
      const stepErrors = check.ok ? {} : onlyFields(check.errors, QUOTE_REQUEST_STEPS[step].fields)
      setErrors(stepErrors)
      if (Object.keys(stepErrors).length === 0) setStep(step + 1)
      else setFocusRequest((n) => n + 1)
      return
    }
    if (!check.ok) {
      const first = QUOTE_REQUEST_STEPS.findIndex((s) => s.fields.some((f) => check.errors[f]))
      setStep(first)
      setErrors(onlyFields(check.errors, QUOTE_REQUEST_STEPS[first].fields))
      setFocusRequest((n) => n + 1)
      return
    }
    setStatus("sending")
    const result = await createLead(check.lead).catch(() => ({ success: false }))
    if (!result.success) {
      setStatus("failed")
      return
    }
    setWhatsappUrl(check.whatsappUrl)
    setStatus("sent")
    window.open(check.whatsappUrl, "_blank", "noopener")
  }

  const fieldId = (field: keyof QuoteRequestForm) => `${id}-${field}`
  const invalid = (field: keyof QuoteRequestForm) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `${fieldId(field)}-erro` } : {}
  const error = (field: keyof QuoteRequestForm) =>
    errors[field] ? (
      <p className="qd__error" id={`${fieldId(field)}-erro`}>
        {errors[field]}
      </p>
    ) : null

  return (
    <QuoteRequestContext.Provider value={api}>
      {children}
      <dialog
        ref={dialogRef}
        className="sc qd"
        data-layout={layout}
        aria-labelledby={`${id}-titulo`}
        onClose={onClose}
        onClick={(e) => e.target === e.currentTarget && close()}
      >
        <div className="qd__panel" ref={bodyRef}>
          <div className="qd__head">
            <p className="sc-label">
              Pedido de orçamento · {status === "sent" ? "enviado" : `passo ${step + 1} de ${LAST_STEP + 1}`}
            </p>
            <button type="button" className="qd__close" aria-label="Fechar" onClick={close}>
              <X aria-hidden="true" />
            </button>
          </div>
          <h2 className="sc-display qd__title" id={`${id}-titulo`}>
            {status === "sent" ? "Pedido enviado!" : QUOTE_REQUEST_STEPS[step].title}
          </h2>

          {status === "sent" ? (
            <div className="qd__done">
              <span className="qd__check" aria-hidden="true">
                <Check />
              </span>
              <p className="sc-body">
                Recebemos seu pedido de orçamento e abrimos o WhatsApp com a mensagem pronta. Se ele não abriu, toque
                abaixo.
              </p>
              <a className="sc-pill sc-pill--red" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Abrir conversa no WhatsApp <ArrowUpRight />
              </a>
              <button type="button" className="sc-pill sc-pill--ghost" onClick={close}>
                Fechar
              </button>
            </div>
          ) : (
            <form className="qd__form" onSubmit={submit} noValidate>
              <div className="qd__progress" aria-hidden="true">
                {QUOTE_REQUEST_STEPS.map((s, i) => (
                  <span key={s.title} data-on={i <= step ? "1" : "0"} />
                ))}
              </div>

              {step === 0 && (
                <>
                  <div className="qd__field">
                    <label className="sc-label" htmlFor={fieldId("name")}>
                      Seu nome
                    </label>
                    <input
                      id={fieldId("name")}
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      {...invalid("name")}
                    />
                    {error("name")}
                  </div>
                  <div className="qd__field">
                    <label className="sc-label" htmlFor={fieldId("whatsapp")}>
                      WhatsApp
                    </label>
                    <input
                      id={fieldId("whatsapp")}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="(37) 99999-9999"
                      value={form.whatsapp}
                      onChange={(e) => update("whatsapp", formatPhone(e.target.value))}
                      {...invalid("whatsapp")}
                    />
                    {error("whatsapp")}
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <div className="qd__field">
                    <label className="sc-label" htmlFor={fieldId("brand")}>
                      Marca
                    </label>
                    <select
                      id={fieldId("brand")}
                      value={form.brand}
                      onChange={(e) => update("brand", e.target.value)}
                      {...invalid("brand")}
                    >
                      <option value="" disabled>
                        Escolha a marca
                      </option>
                      {DEVICE_BRANDS.map((brand) => (
                        <option key={brand}>{brand}</option>
                      ))}
                    </select>
                    {error("brand")}
                  </div>
                  <div className="qd__field">
                    <label className="sc-label" htmlFor={fieldId("model")}>
                      Modelo
                    </label>
                    <input
                      id={fieldId("model")}
                      placeholder="Ex.: iPhone 13, Galaxy A15"
                      value={form.model}
                      onChange={(e) => update("model", e.target.value)}
                      {...invalid("model")}
                    />
                    {error("model")}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="qd__field">
                    <label className="sc-label" htmlFor={fieldId("problem")}>
                      Problema
                    </label>
                    <select
                      id={fieldId("problem")}
                      value={form.problem}
                      onChange={(e) => update("problem", e.target.value)}
                      {...invalid("problem")}
                    >
                      <option value="" disabled>
                        Escolha o problema
                      </option>
                      {PROBLEM_TYPES.map((problem) => (
                        <option key={problem}>{problem}</option>
                      ))}
                    </select>
                    {error("problem")}
                  </div>
                  <div className="qd__field">
                    <label className="sc-label" htmlFor={fieldId("description")}>
                      Conte mais (opcional)
                    </label>
                    <textarea
                      id={fieldId("description")}
                      rows={3}
                      placeholder="O que aconteceu com o aparelho?"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <fieldset className="qd__choices">
                    <legend className="sc-label">Forma de entrega</legend>
                    <label className="qd__choice">
                      <input
                        type="radio"
                        name={fieldId("delivery")}
                        checked={form.delivery === "store"}
                        onChange={() => update("delivery", "store")}
                      />
                      <span>
                        <strong>Vou levar na loja</strong>
                        <small>
                          {ADDRESS.street}, {ADDRESS.unit} · {ADDRESS.district}
                        </small>
                      </span>
                    </label>
                    <label className="qd__choice">
                      <input
                        type="radio"
                        name={fieldId("delivery")}
                        checked={form.delivery === "delivery"}
                        onChange={() => update("delivery", "delivery")}
                      />
                      <span>
                        <strong>Busca e entrega</strong>
                        <small>Consulte disponibilidade e valor para sua região.</small>
                      </span>
                    </label>
                  </fieldset>
                  {form.delivery === "delivery" && (
                    <div className="qd__field">
                      <label className="sc-label" htmlFor={fieldId("address")}>
                        Endereço para a busca
                      </label>
                      <textarea
                        id={fieldId("address")}
                        rows={2}
                        autoComplete="street-address"
                        placeholder="Rua, número, bairro e ponto de referência"
                        value={form.address}
                        onChange={(e) => update("address", e.target.value)}
                        {...invalid("address")}
                      />
                      {error("address")}
                    </div>
                  )}
                </>
              )}

              {status === "failed" && (
                <p className="qd__error" role="alert">
                  Não deu para enviar agora. Tente de novo ou chame a gente no WhatsApp.
                </p>
              )}

              <div className="qd__foot">
                {step > 0 && (
                  <button
                    type="button"
                    className="sc-pill sc-pill--ghost"
                    onClick={() => {
                      setErrors({})
                      setStep(step - 1)
                    }}
                  >
                    <ArrowLeft /> Voltar
                  </button>
                )}
                <button type="submit" className="sc-pill sc-pill--red" disabled={status === "sending"}>
                  {step < LAST_STEP ? (
                    <>
                      Avançar <ArrowRight />
                    </>
                  ) : status === "sending" ? (
                    "Enviando…"
                  ) : (
                    <>
                      Enviar pedido <ArrowUpRight />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </QuoteRequestContext.Provider>
  )
}
