import type React from "react"
import { Smartphone, Battery, Plug, Droplets, Cpu, Settings } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const services = [
  {
    icon: Smartphone,
    title: "Troca de Telas e Vidros",
    description: "Qualidade original para você voltar a ver tudo com clareza.",
  },
  {
    icon: Battery,
    title: "Substituição de Bateria",
    description: "Chega de viver preso ao carregador. Bateria nova, vida nova.",
  },
  {
    icon: Plug,
    title: "Conectores de Carga",
    description: "Seu celular não carrega? Nós resolvemos rapidamente.",
  },
  {
    icon: Droplets,
    title: "Banho Químico",
    description: "Recuperação de aparelhos que caíram na água.",
  },
  {
    icon: Cpu,
    title: "Reparos em Placa",
    description: "Soluções técnicas avançadas para problemas complexos.",
  },
  {
    icon: Settings,
    title: "Formatação e Software",
    description: "Formatação, remoção de conta Google e problemas de software.",
  },
]

export function ServicesSection() {
  return (
    <section id="servicos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Especialistas em dar <span className="text-primary">vida nova</span> ao seu aparelho
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Oferecemos soluções completas para todos os tipos de problemas em smartphones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.title} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface ServiceCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function ServiceCard({ icon: Icon, title, description }: ServiceCardProps) {
  return (
    <Card className="group bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-6">
        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
