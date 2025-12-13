import type React from "react"
import { MapPin, Clock, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

export function LocationSection() {
  return (
    <section id="localizacao" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Visite nossa loja ou <span className="text-primary">peça o Delivery</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Estamos localizados em um ponto estratégico de Divinópolis, com fácil acesso e estacionamento.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Info Card */}
          <div className="bg-card rounded-2xl border border-border p-8 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-6">Informações de Contato</h3>

              <div className="space-y-6">
                <InfoItem
                  icon={MapPin}
                  title="Endereço"
                  content="Av. Anhanguera, 1286, Loja 02"
                  subtitle="Jardim dos Candidés, Divinópolis - MG"
                  extra="CEP: 35502-297"
                />
                <InfoItem icon={Phone} title="Telefone / WhatsApp" content="(37) 99922-0892" />
                <InfoItem
                  icon={Clock}
                  title="Horário de Funcionamento"
                  content="Segunda a Sexta: 8h às 18h"
                  subtitle="Sábado: 8h às 12h"
                />
              </div>
            </div>

            <Button asChild size="lg" className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground">
              <a
                href="https://wa.me/5537999220892?text=Olá%20Saymon%20Cell%2C%20vi%20o%20site%20e%20gostaria%20de%20um%20orçamento%20para..."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="w-5 h-5 mr-2" />
                Chamar no WhatsApp
              </a>
            </Button>
          </div>

          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-border h-[400px] lg:h-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3766.5!2d-44.8986!3d-20.1486!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjDCsDA4JzU1LjAiUyA0NMKwNTMnNTUuMCJX!5e0!3m2!1spt-BR!2sbr!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "400px" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localização Saymon Cell"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

interface InfoItemProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  content: string
  subtitle?: string
  extra?: string
}

function InfoItem({ icon: Icon, title, content, subtitle, extra }: InfoItemProps) {
  return (
    <div className="flex gap-4">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="font-semibold text-foreground">{content}</p>
        {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        {extra && <p className="text-muted-foreground text-sm">{extra}</p>}
      </div>
    </div>
  )
}
