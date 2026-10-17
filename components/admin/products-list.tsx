"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus, Package, Loader2, Pencil } from "lucide-react"
import { formatPrice } from "@/lib/catalog"
import type { Product, ProductCategory } from "@/types/database"
import { uploadProductPhoto } from "@/lib/product-photo"
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
  // Foto escolhida no aparelho, enviada só ao salvar, e a prévia dela
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState("")
  const [saveError, setSaveError] = useState("")

  const clearPhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(null)
    setPhotoPreview("")
  }

  const pickPhoto = (file: File | undefined) => {
    if (!file) return
    clearPhoto()
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setSaveError("")
  }

  const removePhoto = () => {
    clearPhoto()
    setImageUrl("")
  }

  const resetForm = () => {
    clearPhoto()
    setSaveError("")
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
    clearPhoto()
    setSaveError("")
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
    setSaveError("")
    const supabase = createClient()

    try {
      // A foto nova sobe primeiro; se algo falhar, o formulário continua aberto e preenchido.
      const photoUrl = photoFile ? await uploadProductPhoto(photoFile) : imageUrl || null
      const productData = {
        name,
        description: description || null,
        barcode: barcode || null,
        category,
        purchase_price: Number.parseFloat(purchasePrice) || 0,
        sale_price: Number.parseFloat(salePrice),
        stock_quantity: Number.parseInt(stockQuantity) || 0,
        min_stock: Number.parseInt(minStock) || 0,
        image_url: photoUrl,
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
        if (error || !data) throw new Error("Não deu para salvar o produto agora. Tente de novo.")
        setProducts(products.map((p) => (p.id === editingProduct.id ? (data as Product) : p)))
      } else {
        // Create new product
        const { data, error } = await supabase.from("products").insert(productData).select().single()
        if (error || !data) throw new Error("Não deu para salvar o produto agora. Tente de novo.")
        setProducts([data as Product, ...products])
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Não deu para salvar o produto agora. Tente de novo.")
      setIsSubmitting(false)
      return
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
      {/* os números do estoque, como as estatísticas da home */}
      <section aria-label="Estoque" className="grid gap-px overflow-hidden rounded-[20px] border border-sc-line bg-sc-line sm:grid-cols-3">
        <StockStat value={storeProducts.length} label="Na loja virtual" items={[]} note="Produtos que aparecem para os clientes" />
        <StockStat
          value={lowStockProducts.length}
          label="Estoque baixo"
          items={lowStockProducts.slice(0, 3).map((p) => `${p.name} · ${p.stock_quantity}`)}
          note="No mínimo ou abaixo"
          alert={lowStockProducts.length > 0}
        />
        <StockStat
          value={outOfStockProducts.length}
          label="Sem estoque"
          items={outOfStockProducts.slice(0, 3).map((p) => p.name)}
          note="Esgotados"
          alert={outOfStockProducts.length > 0}
        />
      </section>

      <Card>
        <CardHeader className="grid-cols-[1fr_auto] items-end">
          <div className="grid gap-2">
            <p className="sc-label text-sc-stone">Cadastrados</p>
            <CardTitle>{products.length === 1 ? "1 produto" : `${products.length} produtos`}</CardTitle>
          </div>
          <Dialog
            open={showNewDialog}
            onOpenChange={(open) => {
              setShowNewDialog(open)
              if (!open) resetForm()
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus />
                Novo produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar produto" : "Novo produto"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                   
                    placeholder="Ex: Capinha iPhone 14"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                   
                    placeholder="Descrição do produto para a loja..."
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Código de Barras</Label>
                    <Input
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                     
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as ProductCategory)}>
                      <SelectTrigger>
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
                    <Label>Preço de Compra</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                     
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço de Venda *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                     
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantidade em Estoque</Label>
                    <Input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                     
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque Mínimo</Label>
                    <Input
                      type="number"
                      value={minStock}
                      onChange={(e) => setMinStock(e.target.value)}
                     
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Foto</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                      {photoPreview || imageUrl ? (
                        <img
                          src={photoPreview || imageUrl}
                          alt="Prévia da foto do produto"
                          className="w-full h-full object-contain bg-white"
                        />
                      ) : (
                        <Package className="w-8 h-8 text-muted-foreground" aria-hidden="true" />
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <label className="cursor-pointer">
                          {photoPreview || imageUrl ? "Trocar foto" : "Escolher foto"}
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              pickPhoto(e.target.files?.[0])
                              e.target.value = ""
                            }}
                          />
                        </label>
                      </Button>
                      {(photoPreview || imageUrl) && (
                        <Button type="button" variant="ghost" size="sm" onClick={removePhoto}>
                          Remover foto
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A foto é reduzida antes do envio, para a loja virtual abrir rápido no celular.
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="space-y-0.5">
                    <Label className="text-foreground font-medium">Exibir na Loja Virtual</Label>
                    <p className="text-xs text-muted-foreground">Produto ficará visível para clientes no site</p>
                  </div>
                  <Switch checked={showInStore} onCheckedChange={setShowInStore} />
                </div>
              </div>
              {saveError && (
                <p role="alert" className="text-sm text-destructive">
                  {saveError}
                </p>
              )}
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
        <CardContent className="px-2 sm:px-3">
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto mb-4 size-10 text-sc-smoke" aria-hidden="true" />
              <p className="text-sc-stone">Nenhum produto cadastrado</p>
            </div>
          ) : (
            <>
              <div className="sc-label hidden grid-cols-[48px_minmax(0,1fr)_110px_110px_90px_96px_44px] items-center gap-4 border-b border-sc-line px-3 pb-3 text-sc-stone md:grid">
                <span />
                <span>Produto</span>
                <span>Categoria</span>
                <span className="text-right">Venda</span>
                <span className="text-right">Estoque</span>
                <span className="text-center">Na loja</span>
                <span />
              </div>
              <ul className="divide-y divide-sc-line">
                {products.map((product) => {
                  const out = product.stock_quantity === 0
                  const low = !out && product.stock_quantity <= product.min_stock
                  return (
                    <li
                      key={product.id}
                      className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-3 py-3 md:grid-cols-[48px_minmax(0,1fr)_110px_110px_90px_96px_44px] md:gap-4"
                    >
                      <span
                        className={
                          product.image_url
                            ? "relative isolate size-12 overflow-hidden rounded-[10px] bg-sc-bone"
                            : "grid size-12 place-items-center rounded-[10px] bg-sc-raised"
                        }
                      >
                        {product.image_url ? (
                          <Image src={product.image_url} alt="" fill sizes="48px" className="object-contain mix-blend-multiply" />
                        ) : (
                          <Package className="size-5 text-sc-smoke" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-sc-bone">{product.name}</span>
                        <span className="sc-label mt-1 block truncate text-sc-smoke">
                          {CATEGORY_LABELS[product.category]}
                          {product.barcode ? ` · ${product.barcode}` : ""}
                        </span>
                      </span>
                      <span className="text-right md:hidden">
                        <span className="block text-sm font-semibold tabular-nums text-sc-bone">{formatPrice(product.sale_price)}</span>
                        <span className={out || low ? "sc-label mt-1 block text-sc-red" : "sc-label mt-1 block text-sc-stone"}>
                          {out ? "Sem estoque" : `${product.stock_quantity} em estoque`}
                        </span>
                      </span>
                      <span className="sc-label hidden text-sc-stone md:block">{CATEGORY_LABELS[product.category]}</span>
                      <span className="hidden text-right text-sm font-semibold tabular-nums text-sc-bone md:block">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className={out || low ? "hidden items-center justify-end gap-1.5 text-sm font-semibold tabular-nums text-sc-red md:flex" : "hidden items-center justify-end gap-1.5 text-sm tabular-nums text-sc-bone md:flex"}>
                        {(out || low) && <span className="size-1.5 rounded-full bg-sc-red" aria-hidden="true" />}
                        {product.stock_quantity}
                      </span>
                      <span className="col-span-2 flex items-center gap-2.5 md:col-span-1 md:justify-center">
                        <Switch
                          checked={product.show_in_store}
                          onCheckedChange={() => toggleStoreVisibility(product)}
                          aria-label={product.show_in_store ? `Tirar ${product.name} da loja virtual` : `Pôr ${product.name} na loja virtual`}
                        />
                        <span className="sc-label text-sc-stone md:hidden">{product.show_in_store ? "Na loja virtual" : "Fora da loja virtual"}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="justify-self-end"
                        onClick={() => openEditDialog(product)}
                        aria-label={`Editar ${product.name}`}
                        title="Editar produto"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StockStat({ value, label, note, items, alert = false }: { value: number; label: string; note: string; items: string[]; alert?: boolean }) {
  return (
    <div className="flex min-h-[150px] flex-col justify-end gap-2.5 bg-sc-carbon p-5 lg:p-6">
      <span className={alert ? "font-display text-[clamp(48px,5vw,72px)] leading-[0.84] font-black tabular-nums text-sc-red" : "font-display text-[clamp(48px,5vw,72px)] leading-[0.84] font-black tabular-nums text-sc-bone"}>
        {value}
      </span>
      <span className="sc-label text-sc-stone">{label}</span>
      {items.length > 0 ? (
        <ul className="grid gap-0.5 text-[13px] text-sc-stone">
          {items.map((item) => (
            <li key={item} className="truncate">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-[13px] text-sc-stone">{note}</span>
      )}
    </div>
  )
}
