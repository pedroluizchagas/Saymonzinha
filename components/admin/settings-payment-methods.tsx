 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { PaymentMethod } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
 import { Switch } from "@/components/ui/switch"
 import { Loader2, CreditCard } from "lucide-react"
 
 export function SettingsPaymentMethods() {
   const supabase = createClient()
   const [methods, setMethods] = useState<PaymentMethod[]>([])
   const [loading, setLoading] = useState(false)
   const [name, setName] = useState("")
   const [fee, setFee] = useState("")
   const [savingId, setSavingId] = useState<string | null>(null)
 
   const load = async () => {
     setLoading(true)
     const { data } = await supabase.from("payment_methods").select("*").order("name")
     setMethods((data as PaymentMethod[]) || [])
     setLoading(false)
   }
 
   useEffect(() => {
     load()
   }, [])
 
   const addMethod = async () => {
     if (!name.trim()) return
     setSavingId("new")
     await supabase.from("payment_methods").insert({
       name: name.trim(),
       fee_percentage: Number(fee) || 0,
       is_active: true,
     })
     setName("")
     setFee("")
     setSavingId(null)
     load()
   }
 
   const updateMethod = async (m: PaymentMethod, changes: Partial<PaymentMethod>) => {
     setSavingId(m.id)
     await supabase.from("payment_methods").update(changes).eq("id", m.id)
     setSavingId(null)
     load()
   }
 
   return (
     <Card className="bg-card border-border">
       <CardHeader>
         <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-lg">
             <CreditCard className="w-5 h-5 text-primary" />
           </div>
           <CardTitle className="text-lg text-foreground">Formas de Pagamento</CardTitle>
         </div>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
           <div className="space-y-2">
             <Label className="text-foreground">Nome</Label>
             <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cartão Crédito 2x" />
           </div>
           <div className="space-y-2">
             <Label className="text-foreground">% Taxa</Label>
             <Input type="number" step="0.01" value={fee} onChange={(e) => setFee(e.target.value)} placeholder="0.00" />
           </div>
           <div className="flex items-end">
             <Button onClick={addMethod} disabled={savingId === "new"}>
               {savingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
               Adicionar
             </Button>
           </div>
         </div>
 
         <div className="border border-border rounded-lg overflow-hidden">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Nome</TableHead>
                 <TableHead>% Taxa</TableHead>
                 <TableHead>Ativo</TableHead>
                 <TableHead></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {loading ? (
                 <TableRow>
                   <TableCell colSpan={4}>
                     <div className="flex items-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       Carregando...
                     </div>
                   </TableCell>
                 </TableRow>
               ) : methods.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-muted-foreground">
                     Nenhum método cadastrado
                   </TableCell>
                 </TableRow>
               ) : (
                 methods.map((m) => (
                   <TableRow key={m.id}>
                     <TableCell>
                       <Input defaultValue={m.name} onBlur={(e) => updateMethod(m, { name: e.target.value })} />
                     </TableCell>
                     <TableCell className="w-40">
                       <Input
                         type="number"
                         step="0.01"
                         defaultValue={String(m.fee_percentage ?? 0)}
                         onBlur={(e) => updateMethod(m, { fee_percentage: Number(e.target.value) || 0 })}
                       />
                     </TableCell>
                     <TableCell className="w-32">
                       <Switch checked={!!m.is_active} onCheckedChange={(v) => updateMethod(m, { is_active: v })} />
                     </TableCell>
                     <TableCell className="w-28">
                       {savingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                     </TableCell>
                   </TableRow>
                 ))
               )}
             </TableBody>
           </Table>
         </div>
       </CardContent>
     </Card>
   )
 }
