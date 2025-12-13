import type React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { MessageCircle, Star, Shield, Clock } from "lucide-react"
import { PreQuoteForm } from "@/components/forms/pre-quote-form"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/panfletosaymoncell.png"
          alt="Saymon Cell Background"
          fill
          className="object-cover object-top opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge de Autoridade */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">3 Anos de Experiência no Mercado</span>
          </div>

          {/* Headline Principal */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
            Consertamos seu Smartphone <span className="text-primary">sem você sair de casa</span> em Divinópolis
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            A tela quebrou ou a bateria viciou? A <strong className="text-foreground">Saymon Cell</strong> busca, repara
            e devolve seu aparelho novo de novo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <PreQuoteForm />
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 border-primary/30 hover:bg-primary/10 bg-transparent"
            >
              <a
                href="https://wa.me/5537988023341?text=Olá%20Saymon%20Cell%2C%20vi%20o%20site%20e%20gostaria%20de%20um%20orçamento%20para..."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <TrustBadge icon={Shield} title="Garantia" description="Em todos os serviços" />
            <TrustBadge icon={Clock} title="Agilidade" description="Reparo rápido" />
            <TrustBadge icon={MessageCircle} title="Delivery" description="Buscamos e entregamos" />
          </div>
        </div>
      </div>
    </section>
  )
}

interface TrustBadgeProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function TrustBadge({ icon: Icon, title, description }: TrustBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm border border-border rounded-xl">
      <div className="p-2 bg-primary/10 rounded-lg">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-left">
        <p className="font-semibold text-foreground text-sm">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
    </div>
  )
}
