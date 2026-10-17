 "use client"
 
 import { useEffect, useMemo, useState } from "react"
 import { formatPrice } from "@/lib/catalog"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Loader2, Minus, Plus, Trash2 } from "lucide-react"
 import { searchProducts } from "@/lib/actions/pdv-actions"
 import { addServiceOrderItem, getServiceOrderItems, removeServiceOrderItem, updateServiceOrderItemQuantity } from "@/lib/actions/service-order-actions"
 import type { Product, ServiceOrderItem } from "@/types/database"
 import { useRouter } from "next/navigation"
 
 interface OrderItemsFormProps {
   orderId: string
 }
 
 export function OrderItemsForm({ orderId }: OrderItemsFormProps) {
   const router = useRouter()
   const [query, setQuery] = useState("")
   const [results, setResults] = useState<Product[]>([])
   const [loading, setLoading] = useState(false)
   const [items, setItems] = useState<ServiceOrderItem[]>([])
 
   useEffect(() => {
     const fetchItems = async () => {
       const data = await getServiceOrderItems(orderId)
       setItems(data)
     }
     fetchItems()
   }, [orderId])
 
   useEffect(() => {
     const doSearch = async () => {
       if (query.length < 2) {
         setResults([])
         return
       }
       setLoading(true)
       const data = await searchProducts(query)
       setResults((data as any) || [])
       setLoading(false)
     }
     const t = setTimeout(doSearch, 300)
     return () => clearTimeout(t)
   }, [query])
 
   const subtotal = useMemo(() => items.reduce((acc, it) => acc + Number(it.total_price || 0), 0), [items])
 
   const addItem = async (product: Product) => {
     const res = await addServiceOrderItem(orderId, product.id, 1)
     if (res.success) {
       const data = await getServiceOrderItems(orderId)
       setItems(data)
       setQuery("")
       setResults([])
       router.refresh()
     }
   }
 
   const removeItem = async (itemId: string) => {
     const res = await removeServiceOrderItem(orderId, itemId)
     if (res.success) {
       const data = await getServiceOrderItems(orderId)
       setItems(data)
       router.refresh()
     }
   }
 
   const updateQty = async (itemId: string, qty: number) => {
     const res = await updateServiceOrderItemQuantity(orderId, itemId, qty)
     if (res.success) {
       const data = await getServiceOrderItems(orderId)
       setItems(data)
       router.refresh()
     }
   }
 
   return (
     <Card>
       <CardHeader>
         <CardTitle>Peças e produtos</CardTitle>
       </CardHeader>
       <CardContent className="space-y-5">
         <div className="space-y-2">
           <Label htmlFor="os-item-busca">Buscar produto</Label>
           <Input
             id="os-item-busca"
             value={query}
             onChange={(e) => setQuery(e.target.value)}
             placeholder="Nome ou código de barras"
           />
           {loading && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Buscando</p>}
           {!loading && results.length > 0 && (
             <ul className="max-h-64 divide-y divide-sc-line overflow-auto rounded-[14px] border border-sc-line">
               {results.map((p) => (
                 <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                   <div className="min-w-0">
                     <p className="truncate text-sm font-medium">{p.name}</p>
                     <p className="sc-label mt-1 text-sc-smoke">
                       {formatPrice(Number(p.sale_price))} · {p.stock_quantity} em estoque
                     </p>
                   </div>
                   <Button size="sm" variant="secondary" onClick={() => addItem(p)} aria-label={`Adicionar ${p.name} à OS`}>
                     <Plus /> Adicionar
                   </Button>
                 </li>
               ))}
             </ul>
           )}
         </div>
 
         <div className="space-y-2">
           <p className="sc-label text-sc-stone">Na OS</p>
           {items.length === 0 ? (
             <p className="rounded-[14px] border border-dashed border-sc-line px-4 py-6 text-center text-sm text-muted-foreground">
               Nenhuma peça ou produto na OS.
             </p>
           ) : (
             <ul className="divide-y divide-sc-line rounded-[14px] border border-sc-line">
               {items.map((it) => (
                 // no celular: o nome e o total numa linha, a quantidade e o botão de tirar na outra;
                 // do sm em diante, tudo numa linha só
                 <li
                   key={it.id}
                   className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto_7.5rem_auto]"
                 >
                   <div className="min-w-0">
                     <p className="truncate text-sm">{it.description}</p>
                     <p className="sc-label mt-1 text-sc-smoke">
                       {formatPrice(Number(it.unit_price))} cada
                       {it.product?.barcode ? ` · cód. ${it.product.barcode}` : ""}
                     </p>
                   </div>
                   <p className="text-right text-sm font-semibold tabular-nums sm:col-start-3 sm:row-start-1">
                     {formatPrice(Number(it.total_price))}
                   </p>
                   <div className="flex w-fit items-center rounded-full border border-sc-line p-0.5 sm:col-start-2 sm:row-start-1">
                     <Button
                       variant="ghost"
                       size="icon-sm"
                       disabled={it.quantity <= 1}
                       onClick={() => updateQty(it.id, Math.max(1, it.quantity - 1))}
                       aria-label={`Uma unidade a menos de ${it.description}`}
                     >
                       <Minus />
                     </Button>
                     <input
                       value={it.quantity}
                       onChange={(e) => {
                         const v = Number(e.target.value || 1)
                         updateQty(it.id, Math.max(1, v))
                       }}
                       type="number"
                       min={1}
                       inputMode="numeric"
                       aria-label={`Quantidade de ${it.description}`}
                       className="w-9 bg-transparent text-center text-sm tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                     />
                     <Button
                       variant="ghost"
                       size="icon-sm"
                       onClick={() => updateQty(it.id, it.quantity + 1)}
                       aria-label={`Uma unidade a mais de ${it.description}`}
                     >
                       <Plus />
                     </Button>
                   </div>
                   <Button
                     variant="ghost"
                     size="icon-sm"
                     className="justify-self-end hover:bg-sc-ember hover:text-sc-red sm:col-start-4 sm:row-start-1"
                     onClick={() => removeItem(it.id)}
                     aria-label={`Tirar ${it.description} da OS`}
                   >
                     <Trash2 />
                   </Button>
                 </li>
               ))}
             </ul>
           )}
         </div>
 
         <div className="flex items-center justify-between border-t border-sc-line pt-4">
           <p className="text-sm text-muted-foreground">Subtotal dos itens</p>
           <p className="text-sm font-semibold tabular-nums">{formatPrice(subtotal)}</p>
         </div>
       </CardContent>
     </Card>
   )
 }
