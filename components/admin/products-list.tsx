"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Package, Loader2, AlertTriangle, Store, Eye, EyeOff, Pencil } from "lucide-react"
import type { Product, ProductCategory } from "@/types/database"
import Image from "next/image"

interface ProductsListProps {
  products: Product[]
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  accessory: "Acessório",
  part: "Peça",
  service: "Serviço",
  other: "Outro",
}

export function ProductsList({ products: initialProducts }: ProductsListProps) {
  const [products, setProducts] = useState(initialProducts)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [barcode, setBarcode] = useState("")
  const [category, setCategory] = useState<ProductCategory>("accessory")
  const [purchasePrice, setPurchasePrice] = useState("")
  const [salePrice, setSalePrice] = useState("")
  const [stockQuantity, setStockQuantity] = useState("")
  const [minStock, setMinStock] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [showInStore, setShowInStore] = useState(false)

  const resetForm = () => {
    setName("")
    setDescription("")
    setBarcode("")
    setCategory("accessory")
    setPurchasePrice("")
    setSalePrice("")
    setStockQuantity("")
    setMinStock("")
    setImageUrl("")
    setShowInStore(false)
    setEditingProduct(null)
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setName(product.name)
    setDescription(product.description || "")
    setBarcode(product.barcode || "")
    setCategory(product.category)
    setPurchasePrice(product.purchase_price.toString())
    setSalePrice(product.sale_price.toString())
    setStockQuantity(product.stock_quantity.toString())
    setMinStock(product.min_stock.toString())
    setImageUrl(product.image_url || "")
    setShowInStore(product.show_in_store)
    setShowNewDialog(true)
  }

  const handleCreate = async () => {
    setIsSubmitting(true)
    const supabase = createClient()

    const productData = {
      name,
      description: description || null,
      barcode: barcode || null,
      category,
      purchase_price: Number.parseFloat(purchasePrice) || 0,
      sale_price: Number.parseFloat(salePrice),
      stock_quantity: Number.parseInt(stockQuantity) || 0,
      min_stock: Number.parseInt(minStock) || 0,
      image_url: imageUrl || null,
      show_in_store: showInStore,
    }

    if (editingProduct) {
      // Update existing product
      const { data, error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id)
        .select()
        .single()

      if (!error && data) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? (data as Product) : p)))
      }
    } else {
      // Create new product
      const { data, error } = await supabase.from("products").insert(productData).select().single()

      if (!error && data) {
        setProducts([data as Product, ...products])
      }
    }

    setIsSubmitting(false)
    setShowNewDialog(false)
    resetForm()
  }

  const toggleStoreVisibility = async (product: Product) => {
    const supabase = createClient()
    const newValue = !product.show_in_store

    const { error } = await supabase.from("products").update({ show_in_store: newValue }).eq("id", product.id)

    if (!error) {
      setProducts(products.map((p) => (p.id === product.id ? { ...p, show_in_store: newValue } : p)))
    }
  }

  const lowStockProducts = products.filter((p) => p.stock_quantity <= p.min_stock && p.stock_quantity > 0)
  const outOfStockProducts = products.filter((p) => p.stock_quantity === 0)
  const storeProducts = products.filter((p) => p.show_in_store)

  return (
    <div className="space-y-6">
      {/* Alertas e Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info da Loja */}
        <Card className="bg-card border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Produtos na Loja Virtual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{storeProducts.length}</p>
            <p className="text-xs text-muted-foreground">produtos visíveis na loja pública</p>
          </CardContent>
        </Card>

        {/* Alertas de Estoque */}
        {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
          <Card className="bg-card border-yellow-500/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Alertas de Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {outOfStockProducts.slice(0, 3).map((p) => (
                  <Badge key={p.id} className="bg-red-500/10 text-red-500 border-red-500/20">
                    {p.name} - Sem estoque
                  </Badge>
                ))}
                {lowStockProducts.slice(0, 3).map((p) => (
                  <Badge key={p.id} className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                    {p.name} - Baixo ({p.stock_quantity})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-foreground">Lista de Produtos</CardTitle>
          <Dialog
            open={showNewDialog}
            onOpenChange={(open) => {
              setShowNewDialog(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nome *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-input"
                    placeholder="Ex: Capinha iPhone 14"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background border-input"
                    placeholder="Descrição do produto para a loja..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Código de Barras</Label>
                    <Input
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      className="bg-background border-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Categoria *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
                      <SelectTrigger className="bg-background border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accessory">Acessório</SelectItem>
                        <SelectItem value="part">Peça</SelectItem>
                        <SelectItem value="service">Serviço</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Preço de Compra</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="bg-background border-input"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Preço de Venda *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      className="bg-background border-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Quantidade em Estoque</Label>
                    <Input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="bg-background border-input"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Estoque Mínimo</Label>
                    <Input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                      className="bg-background border-input"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">URL da Imagem</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-background border-input"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  {imageUrl && (
                    <div className="mt-2 relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                      <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={() => setImageUrl("")}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">Exibir na Loja Virtual</Label>
                    <p className="text-xs text-muted-foreground">Produto ficará visível para clientes no site</p>
                  </div>
                  <Switch checked={showInStore} onCheckedChange={setShowInStore} />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewDialog(false)
                    resetForm()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!name || !salePrice || isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingProduct ? (
                    "Atualizar"
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground w-12"></TableHead>
                    <TableHead className="text-muted-foreground">Produto</TableHead>
                    <TableHead className="text-muted-foreground">Categoria</TableHead>
                    <TableHead className="text-muted-foreground text-right">Venda</TableHead>
                    <TableHead className="text-muted-foreground text-center">Estoque</TableHead>
                    <TableHead className="text-muted-foreground text-center">Loja</TableHead>
                    <TableHead className="text-muted-foreground text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="border-border">
                      <TableCell>
                        <div className="w-10 h-10 rounded-md bg-muted overflow-hidden">
                          {product.image_url ? (
                            <Image
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          {product.barcode && <p className="text-xs text-muted-foreground">{product.barcode}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-secondary/50">
                          {CATEGORY_LABELS[product.category]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        R$ {product.sale_price.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={
                            product.stock_quantity === 0
                              ? "bg-red-500/10 text-red-500 border-red-500/20"
                              : product.stock_quantity <= product.min_stock
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : "bg-green-500/10 text-green-500 border-green-500/20"
                          }
                        >
                          {product.stock_quantity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={product.show_in_store ? "text-primary" : "text-muted-foreground"}
                          onClick={() => toggleStoreVisibility(product)}
                          title={product.show_in_store ? "Remover da loja" : "Adicionar à loja"}
                        >
                          {product.show_in_store ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                          title="Editar produto"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
