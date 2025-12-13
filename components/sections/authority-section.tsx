"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Award, MapPin, Smartphone } from "lucide-react"

export function AuthoritySection() {
  const [repairsCount, setRepairsCount] = useState(0)

  useEffect(() => {
    const targetCount = 2500
    const duration = 2000
    const steps = 60
    const increment = targetCount / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= targetCount) {
        setRepairsCount(targetCount)
        clearInterval(timer)
      } else {
        setRepairsCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [])

  return (
    <section id="sobre" className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Confiança conquistada em <span className="text-primary">Divinópolis</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              A Saymon Cell celebra <strong className="text-foreground">3 anos de história</strong> cuidando do que
              conecta você ao mundo. Estamos completando 1 ano em nossa nova sede no Jardim dos Candidés, com uma
              estrutura modernizada para oferecer o reparo mais rápido e seguro da região.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={Award} value="3+" label="Anos de Experiência" />
            <StatCard
              icon={Smartphone}
              value={`${repairsCount.toLocaleString("pt-BR")}+`}
              label="Celulares Recuperados"
            />
            <StatCard icon={MapPin} value="1" label="Ano na Nova Sede" />
          </div>
        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
}

function StatCard({ icon: Icon, value, label }: StatCardProps) {
  return (
    <div className="flex flex-col items-center p-8 bg-background rounded-2xl border border-border">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <p className="text-4xl font-bold text-primary mb-2">{value}</p>
      <p className="text-muted-foreground text-center">{label}</p>
    </div>
  )
}
