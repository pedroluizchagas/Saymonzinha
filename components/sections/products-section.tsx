import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShoppingBag } from "lucide-react"
import { getFeaturedProducts } from "@/lib/actions/store-actions"
import { ProductCard } from "@/components/store/product-card"

export async function ProductsSection() {
  const products = await getFeaturedProducts(4)

  // Se não houver produtos cadastrados, não exibe a seção
  if (products.length === 0) {
    return null
  }

  return (
    <section id="produtos" className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <ShoppingBag className="w-4 h-4" />
            Loja Virtual
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Acessórios e <span className="text-primary">Produtos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Capinhas, carregadores, caixinhas de som JBL, fones bluetooth e muito mais. Tudo para deixar seu smartphone
            completo.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button asChild size="lg" variant="outline" className="group bg-transparent">
            <Link href="/loja">
              Ver todos os produtos
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
