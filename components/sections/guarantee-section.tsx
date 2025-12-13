import type React from "react"
import { Shield, Zap, CreditCard, ThumbsUp } from "lucide-react"

const guarantees = [
  {
    icon: Shield,
    title: "Garantia no Serviço",
    description: "Todo reparo acompanha garantia para sua total tranquilidade.",
  },
  {
    icon: Zap,
    title: "Agilidade",
    description: "Sabemos que você não pode ficar sem celular. Reparamos o mais rápido possível.",
  },
  {
    icon: CreditCard,
    title: "Facilidade no Pagamento",
    description: "Aceitamos Pix, dinheiro e cartões de crédito e débito.",
  },
  {
    icon: ThumbsUp,
    title: "Atendimento de Qualidade",
    description: "Tratamos cada cliente com respeito e transparência total.",
  },
]

export function GuaranteeSection() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que escolher a <span className="text-primary">Saymon Cell</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Eliminamos suas preocupações com nossos diferenciais exclusivos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guarantees.map((guarantee) => (
            <GuaranteeCard key={guarantee.title} {...guarantee} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface GuaranteeCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

function GuaranteeCard({ icon: Icon, title, description }: GuaranteeCardProps) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  )
}
