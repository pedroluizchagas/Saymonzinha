"use client"

import { useCart } from "@/contexts/cart-context"
import type { Product } from "@/types/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package } from "lucide-react"
import Image from "next/image"

interface ProductCardProps {
  product: Product
}

const categoryLabels: Record<string, string> = {
  accessory: "Acessório",
  part: "Peça",
  service: "Serviço",
  other: "Outro",
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price)
  }

  const isOutOfStock = product.stock_quantity <= 0

  return (
    <Card className="group bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden">
      <div className="relative aspect-square bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
        )}

        <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">
          {categoryLabels[product.category] || product.category}
        </Badge>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Badge variant="destructive" className="text-sm">
              Esgotado
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{product.description}</p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{formatPrice(product.sale_price)}</span>

          <Button
            size="sm"
            onClick={() => addItem(product)}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {!isOutOfStock && product.stock_quantity <= 5 && (
          <p className="text-xs text-amber-500 mt-2">Apenas {product.stock_quantity} em estoque</p>
        )}
      </CardContent>
    </Card>
  )
}
