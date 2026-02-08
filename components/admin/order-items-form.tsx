 "use client"
 
 import { useEffect, useMemo, useState } from "react"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
 import { Label } from "@/components/ui/label"
 import { Loader2, Plus, Trash2 } from "lucide-react"
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
     <Card className="bg-card border-border">
       <CardHeader>
         <CardTitle className="text-lg text-foreground">Peças / Produtos na OS</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
           <div className="md:col-span-2 space-y-2">
             <Label>Buscar produto</Label>
             <Input
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Digite nome ou código de barras"
               className="bg-background"
             />
             {loading && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Buscando...</p>}
             {!loading && results.length > 0 && (
               <div className="border rounded-md max-h-56 overflow-auto">
                 {results.map((p) => (
                   <div key={p.id} className="flex items-center justify-between p-2 hover:bg-muted">
                     <div>
                       <p className="text-sm font-medium">{p.name}</p>
                       <p className="text-xs text-muted-foreground">R$ {Number(p.sale_price).toFixed(2)} · Estoque: {p.stock_quantity}</p>
                     </div>
                     <Button size="sm" variant="outline" className="bg-transparent" onClick={() => addItem(p)}>
                       <Plus className="w-4 h-4 mr-2" /> Adicionar
                     </Button>
                   </div>
                 ))}
               </div>
             )}
           </div>
         </div>
 
         <div className="space-y-2">
           <Label>Itens adicionados</Label>
           <div className="border rounded-md overflow-hidden">
             <Table>
               <TableHeader>
                 <TableRow className="border-border">
                   <TableHead>Descrição</TableHead>
                   <TableHead className="text-center">Qtde</TableHead>
                   <TableHead className="text-right">Unitário</TableHead>
                   <TableHead className="text-right">Total</TableHead>
                   <TableHead className="text-center">Ações</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {items.length === 0 ? (
                   <TableRow>
                     <TableCell colSpan={5} className="text-center text-muted-foreground">
                       Nenhum item
                     </TableCell>
                   </TableRow>
                 ) : (
                   items.map((it) => (
                     <TableRow key={it.id} className="border-border">
                       <TableCell>
                         <p className="text-sm">{it.description}</p>
                         {it.product?.barcode && <p className="text-xs text-muted-foreground">Cod: {it.product.barcode}</p>}
                       </TableCell>
                       <TableCell className="text-center">
                         <div className="flex items-center justify-center gap-2">
                           <Button
                             variant="outline"
                             size="sm"
                             className="bg-transparent"
                             onClick={() => updateQty(it.id, Math.max(1, it.quantity - 1))}
                           >
                             -
                           </Button>
                           <Input
                             value={it.quantity}
                             onChange={(e) => {
                               const v = Number(e.target.value || 1)
                               updateQty(it.id, Math.max(1, v))
                             }}
                             type="number"
                             min={1}
                             className="w-16 text-center"
                           />
                           <Button variant="outline" size="sm" className="bg-transparent" onClick={() => updateQty(it.id, it.quantity + 1)}>
                             +
                           </Button>
                         </div>
                       </TableCell>
                       <TableCell className="text-right">R$ {Number(it.unit_price).toFixed(2)}</TableCell>
                       <TableCell className="text-right">R$ {Number(it.total_price).toFixed(2)}</TableCell>
                       <TableCell className="text-center">
                         <Button variant="ghost" size="icon" onClick={() => removeItem(it.id)}>
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       </TableCell>
                     </TableRow>
                   ))
                 )}
               </TableBody>
             </Table>
           </div>
         </div>
 
         <div className="flex items-center justify-between">
           <p className="text-sm text-muted-foreground">Subtotal dos itens</p>
           <p className="text-sm font-semibold">R$ {subtotal.toFixed(2)}</p>
         </div>
       </CardContent>
     </Card>
   )
 }
 
