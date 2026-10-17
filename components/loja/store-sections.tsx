// Seções da loja virtual no vocabulário visual da home: os passos do pedido de compra (a linha do tempo
// da Raio-X), a faixa vermelha da retirada e da entrega, e a chamada recebida do rodapé, que abre o
// WhatsApp como na home. Só fatos: nada que a loja não possa cumprir.

import { ArrowUpRight, MapPin, Phone } from "lucide-react"
import { CallSlider } from "@/components/home/shared/device-ui"
import { ADDRESS, HOURS, MAPS_URL, whatsappLink } from "@/components/home/shared/content"

const STEPS = [
  { title: "Escolha", description: "Adicione ao carrinho os produtos e as quantidades." },
  { title: "Envie", description: "O pedido de compra vai pronto pelo WhatsApp, com o total e a forma de receber." },
  { title: "Combine", description: "A loja confirma a disponibilidade e combina o pagamento com você. Não há pagamento no site." },
  { title: "Receba", description: "Retire na loja ou receba em casa, conforme a disponibilidade e o valor para a sua região." },
]

export const STORE_CALL_MESSAGE = "Olá Saymon Cell! Vi a loja virtual e tenho uma dúvida."

export function PurchaseSteps() {
  return (
    <section className="lv-section lv-steps" aria-labelledby="lv-steps-title">
      <div className="lv-head">
        <p className="sc-label lv-muted">Como funciona</p>
        <h2 className="sc-display lv-h2" id="lv-steps-title">
          Pedido de compra em {STEPS.length} passos
        </h2>
      </div>
      <ol className="lv-timeline">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <span className="sc-label lv-red-text">Passo {String(i + 1).padStart(2, "0")}</span>
            <h3 className="sc-display lv-h3">{step.title}</h3>
            <p className="sc-body lv-muted">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ReceivingBand() {
  return (
    <section className="lv-band" aria-label="Retirada e entrega">
      <div className="lv-band__col">
        <p className="sc-label">01 · Na loja</p>
        <h2 className="sc-display lv-band__title">Retirada</h2>
        <p className="sc-body">
          {ADDRESS.street}, {ADDRESS.unit} · {ADDRESS.district} · {ADDRESS.city}
          <br />
          {HOURS.map((h) => `${h.days}, ${h.time}`).join(" · ")}
        </p>
        <a className="sc-pill sc-pill--ink" href={MAPS_URL} target="_blank" rel="noopener noreferrer">
          <MapPin aria-hidden="true" /> Abrir no Maps
        </a>
      </div>
      <div className="lv-band__col">
        <p className="sc-label">02 · Na sua casa</p>
        <h2 className="sc-display lv-band__title">Entrega</h2>
        <p className="sc-body">
          Conforme a disponibilidade e o valor para a sua região. A loja confirma pelo WhatsApp quando recebe o pedido de
          compra.
        </p>
        <a
          className="sc-pill sc-pill--ink"
          href={whatsappLink("Olá Saymon Cell! Vi a loja virtual e quero saber da entrega para a minha região.")}
          target="_blank"
          rel="noopener noreferrer"
        >
          Consultar a entrega <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}

/** A chamada recebida da Saymon Cell, como no fim da home: deslizar para atender abre o WhatsApp. */
export function StoreCall() {
  return (
    <div className="lv-call" role="group" aria-label="Chamada recebida da Saymon Cell">
      <span className="lv-call__avatar" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/glyph.png" alt="" />
      </span>
      <div className="lv-call__text">
        <p className="sc-ui">Saymon Cell</p>
        <p className="sc-label lv-muted">
          <Phone aria-hidden="true" /> Chamada recebida · sobre a loja virtual
        </p>
      </div>
      <div className="lv-call__slider">
        <CallSlider href={whatsappLink(STORE_CALL_MESSAGE)} />
      </div>
    </div>
  )
}
