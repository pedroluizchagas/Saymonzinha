"use client"

// Carrinho da loja virtual na janela do site: folha que sobe de baixo no celular e, no computador, um
// celular ao lado da página, como o aparelho da Desdobra, com a barra de status. Mostra os itens já
// conferidos com o banco, a forma de receber, a mensagem que vai pelo WhatsApp e envia o pedido de
// compra. Depois do envio, a tela vira a conversa com a mensagem pronta; o carrinho continua guardado,
// com a opção de esvaziar.

import { ArrowUpRight, ChevronDown, House, Store, Trash2, X } from "lucide-react"
import { useId, useState } from "react"
import { ADDRESS, WHATSAPP_DISPLAY } from "@/components/home/shared/content"
import { StatusBar, useClock } from "@/components/home/shared/device-ui"
import { Modal, type ModalLayout } from "@/components/home/shared/modal"
import { useCart } from "@/contexts/cart-context"
import { formatPrice, productPath } from "@/lib/catalog"
import { checkPurchaseRequest, type Receiving } from "@/lib/purchase-request"
import type { Product } from "@/types/database"
import { Price } from "./price"
import { QuantityStepper } from "./quantity-stepper"

export function CartDialog({
  open,
  onClose,
  layout,
  published,
  removed,
}: {
  open: boolean
  onClose: () => void
  layout: ModalLayout
  /** Produtos publicados, lidos do banco ao abrir; enquanto não chegam, os do próprio carrinho. */
  published: Product[] | null
  /** Produtos que saíram do carrinho na conferência, para o aviso. */
  removed: string[]
}) {
  const id = useId()
  const cart = useCart()
  const time = useClock()
  const [receiving, setReceiving] = useState<Receiving>("retirada")
  const [sent, setSent] = useState(false)
  const request = checkPurchaseRequest(cart.items, published ?? cart.items.map((i) => i.product), receiving)
  const count = cart.getItemCount()

  const close = () => {
    setSent(false)
    onClose()
  }
  const send = () => {
    window.open(request.whatsappUrl, "_blank", "noopener")
    setSent(true)
  }

  // No computador, o carrinho é um celular ao lado da página; na folha do celular, a própria tela.
  const device = layout === "side"

  return (
    <Modal open={open} onClose={close} layout={layout} labelledBy={`${id}-titulo`} className="lv-cartd">
      <div className={device ? "sc-device lv-cartd__device" : "lv-cartd__device"}>
        <div className={device ? "sc-device__bezel" : undefined}>
          <div className={device ? "sc-device__screen lv-cartd__screen" : "lv-cartd__screen"}>
            {device && <StatusBar time={time} />}
            <div className="lv-cartd__panel">
              <div className="lv-cartd__head">
                <p className="sc-label">
                  {sent ? "WhatsApp · Saymon Cell" : `Carrinho · ${count} ${count === 1 ? "item" : "itens"}`}
                </p>
                <button type="button" className="lv-cartd__close" aria-label="Fechar" onClick={close}>
                  <X aria-hidden="true" />
                </button>
              </div>
              <h2 className="sc-display lv-cartd__title" id={`${id}-titulo`}>
                {sent ? "Pedido de compra enviado" : "Seu carrinho"}
              </h2>

              {removed.length > 0 && !sent && (
                <p className="sc-body lv-cartd__notice" role="status">
                  {removed.length === 1 ? "1 produto saiu da loja virtual" : `${removed.length} produtos saíram da loja virtual`}:{" "}
                  {removed.join(", ")}.
                </p>
              )}

              {sent ? (
                <div className="lv-cartd__done">
                  <div className="lv-chat">
                    <p className="sc-label lv-chat__day">Hoje</p>
                    <p className="lv-chat__bubble">
                      {request.message}
                      <span className="lv-chat__time">{time}</span>
                    </p>
                  </div>
                  <p className="sc-body">
                    Abrimos o WhatsApp com o pedido de compra pronto para o número {WHATSAPP_DISPLAY}. A loja confirma a
                    disponibilidade e combina o pagamento com você. Se ele não abriu, toque abaixo.
                  </p>
                  <a className="sc-pill sc-pill--red" href={request.whatsappUrl} target="_blank" rel="noopener noreferrer">
                    Abrir conversa no WhatsApp <ArrowUpRight aria-hidden="true" />
                  </a>
                  <div className="lv-cartd__after">
                    <button
                      type="button"
                      className="sc-pill sc-pill--ghost"
                      onClick={() => {
                        cart.clearCart()
                        close()
                      }}
                    >
                      Esvaziar carrinho
                    </button>
                    <button type="button" className="sc-pill sc-pill--ghost" onClick={close}>
                      Continuar comprando
                    </button>
                  </div>
                </div>
              ) : request.items.length === 0 ? (
                <div className="lv-cartd__empty">
                  <p className="sc-body">Seu carrinho está vazio.</p>
                  <button type="button" className="sc-pill sc-pill--ghost" onClick={close}>
                    Ver os produtos
                  </button>
                </div>
              ) : (
                <>
                  <ul className="lv-cartd__items">
                    {request.items.map(({ product, quantity, subtotal }) => (
                      <li key={product.id} className="lv-cartd__item">
                        <a className="lv-photo lv-cartd__thumb" href={productPath(product)} data-empty={product.image_url ? undefined : "1"}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={product.image_url || "/home/glyph.png"} alt="" />
                        </a>
                        <div className="lv-cartd__info">
                          <a className="lv-cartd__name" href={productPath(product)}>
                            {product.name}
                          </a>
                          <span className="lv-cartd__unit">{formatPrice(product.sale_price)} cada</span>
                          <div className="lv-cartd__row">
                            <QuantityStepper
                              small
                              value={quantity}
                              max={product.stock_quantity}
                              onChange={(next) => cart.updateQuantity(product.id, next)}
                              label={`Quantidade de ${product.name}`}
                            />
                            <Price value={subtotal} className="lv-cartd__subtotal" />
                            <button
                              type="button"
                              className="lv-cartd__remove"
                              aria-label={`Remover ${product.name} do carrinho`}
                              onClick={() => cart.removeItem(product.id)}
                            >
                              <Trash2 aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <fieldset className="lv-cartd__choices">
                    <legend className="sc-label">Como receber</legend>
                    <label className="lv-cartd__choice">
                      <input type="radio" name={`${id}-receber`} checked={receiving === "retirada"} onChange={() => setReceiving("retirada")} />
                      <Store aria-hidden="true" />
                      <span>
                        <strong>Retirar na loja</strong>
                        <small>
                          {ADDRESS.street}, {ADDRESS.unit} · {ADDRESS.district}
                        </small>
                      </span>
                    </label>
                    <label className="lv-cartd__choice">
                      <input type="radio" name={`${id}-receber`} checked={receiving === "entrega"} onChange={() => setReceiving("entrega")} />
                      <House aria-hidden="true" />
                      <span>
                        <strong>Receber em casa</strong>
                        <small>Consulte disponibilidade e valor para sua região.</small>
                      </span>
                    </label>
                  </fieldset>

                  <details className="lv-cartd__preview">
                    <summary className="sc-label">
                      Ver a mensagem que vai pelo WhatsApp <ChevronDown aria-hidden="true" />
                    </summary>
                    <div className="lv-chat">
                      <p className="lv-chat__bubble">{request.message}</p>
                    </div>
                  </details>

                  <div className="lv-cartd__foot">
                    <p className="lv-cartd__total">
                      <span className="sc-label">Total</span>
                      <Price value={request.total} />
                    </p>
                    <button type="button" className="sc-pill sc-pill--red lv-cartd__send" onClick={send}>
                      Enviar pedido de compra pelo WhatsApp <ArrowUpRight aria-hidden="true" />
                    </button>
                    <p className="sc-body lv-cartd__note">
                      Sem pagamento no site: a loja confirma a disponibilidade e combina o pagamento pelo WhatsApp.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {device && (
          <>
            <i className="sc-device__btn sc-device__btn--a" aria-hidden="true" />
            <i className="sc-device__btn sc-device__btn--b" aria-hidden="true" />
          </>
        )}
      </div>
    </Modal>
  )
}
