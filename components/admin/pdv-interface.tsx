"use client"

import { formatPrice } from "@/lib/catalog"
import { Money } from "./money"
import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Search, Plus, Trash2, ShoppingCart, CheckCircle2, Loader2, Barcode } from "lucide-react"
import { createSale, searchProducts, getProductByBarcode } from "@/lib/actions/pdv-actions"
import type { PaymentMethod, Product } from "@/types/database"

interface CartItem {
  id: string
  product_id?: string
  name: string
  quantity: number
  unit_price: number
}

interface PDVInterfaceProps {
  paymentMethods: PaymentMethod[]
  products: Product[]
}

export function PDVInterface({ paymentMethods, products }: PDVInterfaceProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [discount, setDiscount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState("")
  const barcodeRef = useRef<HTMLInputElement>(null)

  // Busca de produtos
  useEffect(() => {
    const search = async () => {
      if (searchQuery.length >= 2) {
        const results = await searchProducts(searchQuery)
        setSearchResults(results as Product[])
      } else {
        setSearchResults([])
      }
    }
    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Leitura de código de barras
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!barcodeInput.trim()) return

    const product = await getProductByBarcode(barcodeInput.trim())
    if (product) {
      addToCart(product as Product)
    }
    setBarcodeInput("")
    barcodeRef.current?.focus()
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id)

    if (existingItem) {
      setCart(cart.map((item) => (item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([
        ...cart,
        {
          id: crypto.randomUUID(),
          product_id: product.id,
          name: product.name,
          quantity: 1,
          unit_price: product.sale_price,
        },
      ])
    }

    setSearchQuery("")
    setSearchResults([])
  }

  const addCustomItem = () => {
    setCart([
      ...cart,
      {
        id: crypto.randomUUID(),
        name: "Item avulso",
        quantity: 1,
        unit_price: 0,
      },
    ])
  }

  const updateItem = (id: string, field: keyof CartItem, value: string | number) => {
    setCart(cart.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const removeItem = (id: string) => {
    setCart(cart.filter((item) => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  const discountValue = Number.parseFloat(discount) || 0
  const total = subtotal - discountValue

  const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod)
  const fee = selectedMethod ? (total * selectedMethod.fee_percentage) / 100 : 0
  const netTotal = total - fee

  const handleFinalizeSale = async () => {
    if (cart.length === 0 || !selectedPaymentMethod) return

    setIsSubmitting(true)

    const result = await createSale({
      items: cart.map((item) => ({
        product_id: item.product_id,
        description: item.name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
      payment_method_id: selectedPaymentMethod,
      discount: discountValue,
    })

    setIsSubmitting(false)

    if (result.success) {
      setShowSuccess(true)
      setCart([])
      setSelectedPaymentMethod("")
      setDiscount("")
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Área de Produtos */}
      <div className="lg:col-span-2 space-y-4">
        {/* Busca e Código de Barras */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
              {/* Busca - ocupa toda a linha no mobile */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-input"
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1.5 max-h-64 overflow-y-auto rounded-[14px] border border-sc-line bg-sc-raised p-1.5 shadow-[0_14px_26px_-14px_rgba(0,0,0,0.5)]">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addToCart(product)}
                        className="w-full rounded-[10px] p-3 text-left transition-colors hover:bg-white/[0.06]"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="sc-label mt-1 text-sc-stone">{product.stock_quantity} em estoque</p>
                          </div>
                          <p className="font-semibold tabular-nums text-sc-bone">{formatPrice(product.sale_price)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Codigo de barras + Item Avulso lado a lado no mobile */}
              <div className="flex gap-2">
                <form onSubmit={handleBarcodeSubmit} className="flex-1 lg:flex-none">
                  <div className="relative">
                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={barcodeRef}
                      placeholder="Cod. barras"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      className="pl-10 lg:w-40 border-input"
                    />
                  </div>
                </form>

                <Button type="button" variant="outline" onClick={addCustomItem} className="shrink-0">
                  <Plus />
                  Item avulso
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carrinho */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Carrinho</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Carrinho vazio</p>
                <p className="text-sm text-muted-foreground">Adicione produtos para iniciar uma venda</p>
              </div>
            ) : (
              <ul className="divide-y divide-sc-line">
                {cart.map((item) => (
                  // no celular: a descrição e o botão de tirar numa linha, quantidade, preço e total na outra;
                  // do sm em diante, tudo numa linha só
                  <li
                    key={item.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-2 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_6.5rem_8rem_6.5rem_auto] sm:items-center"
                  >
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                      aria-label="Descrição do item"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="hover:bg-sc-ember hover:text-sc-red sm:col-start-5 sm:row-start-1"
                      aria-label={`Tirar ${item.name} da venda`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="col-span-2 grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-2 sm:contents">
                      <label className="relative sm:col-start-2 sm:row-start-1">
                        <span className="sc-label pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sc-smoke">Qtd</span>
                        <Input
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                          className="pl-11 text-right tabular-nums"
                          aria-label="Quantidade"
                        />
                      </label>
                      <label className="relative sm:col-start-3 sm:row-start-1">
                        <span className="sc-label pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sc-smoke">R$</span>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          inputMode="decimal"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, "unit_price", Number.parseFloat(e.target.value) || 0)}
                          className="pl-10 text-right tabular-nums"
                          aria-label="Preço de cada um, em reais"
                        />
                      </label>
                      <p className="text-right font-semibold tabular-nums text-foreground sm:col-start-4 sm:row-start-1">
                        {formatPrice(item.quantity * item.unit_price)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo e Pagamento */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <p className="sc-label text-sc-stone">Resumo</p>
            <CardTitle>Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-sc-stone">Subtotal</dt>
                <dd className="tabular-nums text-sc-bone">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-sc-stone">Desconto</dt>
                <dd className="tabular-nums text-sc-bone">− {formatPrice(discountValue)}</dd>
              </div>
            </dl>

            {/* o total no bloco vermelho, como o valor da nota de serviço */}
            <div className="flex items-end justify-between gap-3 rounded-[18px] bg-sc-red px-4 py-4 text-sc-ink">
              <span className="sc-label">Total</span>
              <Money value={total} className="text-[44px]" />
            </div>

            {fee > 0 && (
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-sc-stone">Taxa ({selectedMethod?.fee_percentage}%)</dt>
                  <dd className="tabular-nums text-sc-red">− {formatPrice(fee)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sc-stone">Valor líquido</dt>
                  <dd className="font-semibold tabular-nums text-sc-bone">{formatPrice(netTotal)}</dd>
                </div>
              </dl>
            )}

            <div className="space-y-2">
              <Label>Desconto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Forma de pagamento *</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      {method.name} {method.fee_percentage > 0 && `(${method.fee_percentage}%)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleFinalizeSale}
              disabled={cart.length === 0 || !selectedPaymentMethod || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  Finalizando
                </>
              ) : (
                <>
                  <CheckCircle2 />
                  Finalizar venda
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Produtos Rápidos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Atalhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 6).map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addToCart(product)}
                  className="h-auto justify-start rounded-[14px] py-2.5 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium">{product.name}</p>
                    <p className="text-xs tabular-nums text-sc-stone">{formatPrice(product.sale_price)}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Sucesso */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-sc-red-strong">
              <CheckCircle2 className="size-8 text-white" />
            </div>
            <DialogTitle className="pr-0 text-center">Venda registrada</DialogTitle>
            <DialogDescription className="text-center">A venda entrou no fluxo de caixa do financeiro, e o estoque dos produtos já baixou.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)} className="w-full">
              Nova venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
