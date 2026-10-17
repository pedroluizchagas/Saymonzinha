// Rodapé das duas versões da home e da loja virtual: endereço, contatos, menu e ©. As cores vêm de quem
// o usa; fora da home, o menu vem com os endereços completos (siteMenu).

import { ADDRESS, INSTAGRAM_URL, MENU, PHONE_URL, WHATSAPP_DISPLAY, whatsappLink } from "./content"

export function HomeFooter({ menu = MENU }: { menu?: { label: string; href: string }[] }) {
  return (
    <div className="sc-footer">
      <div className="sc-footer__col">
        <p className="sc-label sc-footer__title">Saymon Cell</p>
        <p>
          {ADDRESS.street}, {ADDRESS.unit}
          <br />
          {ADDRESS.district} · {ADDRESS.city}
        </p>
      </div>
      <div className="sc-footer__col">
        <p className="sc-label sc-footer__title">Contato</p>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
          WhatsApp {WHATSAPP_DISPLAY}
        </a>
        <a href={PHONE_URL}>Ligar {WHATSAPP_DISPLAY}</a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          Instagram @saymoncell037
        </a>
      </div>
      <nav className="sc-footer__col" aria-label="Rodapé">
        <p className="sc-label sc-footer__title">Navegue</p>
        {menu.map((item) => (
          <a key={item.href} href={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <p className="sc-label sc-footer__legal">© {new Date().getFullYear()} Saymon Cell · Assistência técnica</p>
    </div>
  )
}
