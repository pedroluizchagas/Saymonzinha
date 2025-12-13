"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-input"
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                    {searchResults.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addToCart(product)}
                        className="w-full p-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-xs text-muted-foreground">Estoque: {product.stock_quantity}</p>
                          </div>
                          <p className="font-semibold text-primary">R$ {product.sale_price.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    ref={barcodeRef}
                    placeholder="Código de barras"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="pl-10 w-40 bg-background border-input"
                  />
                </div>
              </form>

              <Button type="button" variant="outline" onClick={addCustomItem} className="bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Item Avulso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Carrinho */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Carrinho
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Carrinho vazio</p>
                <p className="text-sm text-muted-foreground">Adicione produtos para iniciar uma venda</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Produto</TableHead>
                    <TableHead className="text-muted-foreground w-24">Qtd</TableHead>
                    <TableHead className="text-muted-foreground w-32">Preço</TableHead>
                    <TableHead className="text-muted-foreground w-28">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id} className="border-border">
                      <TableCell>
                        <Input
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          className="bg-background border-input"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                          className="bg-background border-input"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, "unit_price", Number.parseFloat(e.target.value) || 0)}
                          className="bg-background border-input"
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        R$ {(item.quantity * item.unit_price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo e Pagamento */}
      <div className="space-y-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Resumo da Venda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">R$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Desconto</span>
                <span className="text-foreground">- R$ {discountValue.toFixed(2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-foreground">Total</span>
                <span className="text-primary">R$ {total.toFixed(2)}</span>
              </div>
              {fee > 0 && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Taxa ({selectedMethod?.fee_percentage}%)</span>
                    <span className="text-destructive">- R$ {fee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor Líquido</span>
                    <span className="text-green-500">R$ {netTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Desconto (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Forma de Pagamento *</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger className="bg-background border-input">
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
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finalizar Venda
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Produtos Rápidos */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Produtos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {products.slice(0, 6).map((product) => (
                <Button
                  key={product.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addToCart(product)}
                  className="justify-start text-left h-auto py-2 bg-transparent"
                >
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">R$ {product.sale_price.toFixed(2)}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Sucesso */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="bg-card border-border">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <DialogTitle className="text-foreground">Venda Realizada!</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              A venda foi registrada com sucesso no sistema.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccess(false)} className="w-full bg-primary hover:bg-primary/90">
              Nova Venda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
