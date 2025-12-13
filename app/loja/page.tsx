import { Suspense } from "react"
import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { WhatsAppButton } from "@/components/ui/whatsapp-button"
import { StoreContent } from "@/components/store/store-content"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Loja | Saymon Cell - Acessórios para Smartphones",
  description:
    "Capinhas, carregadores, caixinhas JBL, fones bluetooth e muito mais. Acessórios de qualidade para seu smartphone em Divinópolis.",
  keywords: ["acessórios celular", "capinha", "carregador", "JBL", "fone bluetooth", "Divinópolis"],
}

function StoreSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 w-full md:w-64" />
        <Skeleton className="h-10 w-full md:w-48" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StorePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nossa <span className="text-primary">Loja</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Encontre os melhores acessórios para seu smartphone. Capinhas, carregadores, caixinhas de som, fones e
              muito mais.
            </p>
          </div>

          <Suspense fallback={<StoreSkeleton />}>
            <StoreContent />
          </Suspense>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
