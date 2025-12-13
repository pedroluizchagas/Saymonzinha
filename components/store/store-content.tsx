"use client"

import { useState, useEffect, useCallback } from "react"
import { getStoreProducts, getStoreProductsByCategory } from "@/lib/actions/store-actions"
import type { Product, ProductCategory } from "@/types/database"
import { ProductCard } from "@/components/store/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Package } from "lucide-react"

const categories: { value: ProductCategory | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "accessory", label: "Acessórios" },
  { value: "part", label: "Peças" },
  { value: "other", label: "Outros" },
]

export function StoreContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const data =
        selectedCategory === "all" ? await getStoreProducts() : await getStoreProductsByCategory(selectedCategory)
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error("Erro ao carregar produtos:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  return (
    <div className="space-y-8">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de Produtos */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-6 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum produto encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Tente buscar por outro termo" : "Em breve teremos novidades para você!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Contador de resultados */}
      {!isLoading && filteredProducts.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          Exibindo {filteredProducts.length} produto{filteredProducts.length !== 1 && "s"}
        </p>
      )}
    </div>
  )
}
