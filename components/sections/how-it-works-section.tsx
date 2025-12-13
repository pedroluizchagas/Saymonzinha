import type React from "react"
import { MessageSquare, Truck, Wrench, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: MessageSquare,
    title: "Contato",
    description: "Você nos chama no WhatsApp e explica o problema do seu aparelho.",
    step: 1,
  },
  {
    icon: Truck,
    title: "Busca",
    description: "Nós vamos até você (casa ou trabalho) retirar o aparelho.",
    step: 2,
  },
  {
    icon: Wrench,
    title: "Reparo",
    description: "Realizamos o diagnóstico e o reparo em nosso laboratório de ponta.",
    step: 3,
  },
  {
    icon: CheckCircle,
    title: "Entrega",
    description: "Devolvemos seu smartphone funcionando perfeitamente.",
    step: 4,
  },
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Do defeito à solução em <span className="text-primary">4 passos simples</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Nosso serviço de delivery facilita sua vida. Você não precisa sair de casa para ter seu smartphone reparado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.step} {...step} isLast={index === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface StepCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  step: number
  isLast: boolean
}

function StepCard({ icon: Icon, title, description, step, isLast }: StepCardProps) {
  return (
    <div className="relative">
      {/* Connector Line */}
      {!isLast && <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-border" />}

      <div className="flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border hover:border-primary/30 transition-colors">
        {/* Step Number */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
          {step}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 mt-4">
          <Icon className="w-8 h-8 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  )
}
