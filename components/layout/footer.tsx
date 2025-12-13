import Image from "next/image"
import Link from "next/link"
import { Instagram, Facebook, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo e Descrição */}
          <div>
            <Image
              src="/images/chatgpt-20image-2023-20de-20jun.png"
              alt="Saymon Cell - Assistência Técnica"
              width={150}
              height={50}
              className="h-10 w-auto mb-4"
            />
            <p className="text-muted-foreground text-sm">
              Referência em reparo de smartphones em Divinópolis. Tecnologia de ponta, conforto de casa.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Links Rápidos</h4>
            <nav className="flex flex-col gap-2">
              <Link href="#servicos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Serviços
              </Link>
              <Link
                href="#como-funciona"
                className="text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                Como Funciona
              </Link>
              <Link href="#sobre" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Sobre Nós
              </Link>
              <Link href="#localizacao" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Localização
              </Link>
            </nav>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contato</h4>
            <div className="space-y-3">
              <a
                href="tel:+5537999220892"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                (37) 99922-0892
              </a>
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Av. Anhanguera, 1286, Loja 02
                  <br />
                  Jardim dos Candidés, Divinópolis - MG
                </span>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <a
                  href="https://instagram.com/saymoncell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5 text-primary" />
                </a>
                <a
                  href="https://facebook.com/saymoncell"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5 text-primary" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Saymon Cell - Assistência Técnica. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
