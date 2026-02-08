 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { ProblemType } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
 import { Switch } from "@/components/ui/switch"
 import { Textarea } from "@/components/ui/textarea"
 import { Loader2, Tag } from "lucide-react"
 
 export function SettingsProblemTypes() {
   const supabase = createClient()
   const [items, setItems] = useState<ProblemType[]>([])
   const [loading, setLoading] = useState(false)
   const [name, setName] = useState("")
   const [description, setDescription] = useState("")
   const [estimated, setEstimated] = useState("")
   const [savingId, setSavingId] = useState<string | null>(null)
 
   const load = async () => {
     setLoading(true)
     const { data } = await supabase.from("problem_types").select("*").order("name")
     setItems((data as ProblemType[]) || [])
     setLoading(false)
   }
 
   useEffect(() => {
     load()
   }, [])
 
   const addItem = async () => {
     if (!name.trim()) return
     setSavingId("new")
     await supabase.from("problem_types").insert({
       name: name.trim(),
       description: description.trim() || null,
       estimated_price: estimated ? Number(estimated) : null,
       is_active: true,
     })
     setName("")
     setDescription("")
     setEstimated("")
     setSavingId(null)
     load()
   }
 
   const updateItem = async (it: ProblemType, changes: Partial<ProblemType>) => {
     setSavingId(it.id)
     await supabase.from("problem_types").update(changes).eq("id", it.id)
     setSavingId(null)
     load()
   }
 
   return (
     <Card className="bg-card border-border">
       <CardHeader>
         <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-lg">
             <Tag className="w-5 h-5 text-primary" />
           </div>
           <CardTitle className="text-lg text-foreground">Tipos de Serviço</CardTitle>
         </div>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
           <div className="space-y-2 md:col-span-2">
             <Label className="text-foreground">Nome</Label>
             <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Troca de Tela" />
           </div>
           <div className="space-y-2">
             <Label className="text-foreground">Preço estimado</Label>
             <Input type="number" step="0.01" value={estimated} onChange={(e) => setEstimated(e.target.value)} placeholder="0.00" />
           </div>
           <div className="flex items-end">
             <Button onClick={addItem} disabled={savingId === "new"}>
               {savingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
               Adicionar
             </Button>
           </div>
         </div>
         <div className="space-y-2">
           <Label className="text-foreground">Descrição</Label>
           <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes do serviço" />
         </div>
 
         <div className="border border-border rounded-lg overflow-hidden">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Nome</TableHead>
                 <TableHead>Preço</TableHead>
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
               ) : items.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-muted-foreground">
                     Nenhum tipo cadastrado
                   </TableCell>
                 </TableRow>
               ) : (
                 items.map((it) => (
                   <TableRow key={it.id}>
                     <TableCell>
                       <Input defaultValue={it.name} onBlur={(e) => updateItem(it, { name: e.target.value })} />
                     </TableCell>
                     <TableCell className="w-40">
                       <Input
                         type="number"
                         step="0.01"
                         defaultValue={it.estimated_price !== null ? String(it.estimated_price) : ""}
                         onBlur={(e) =>
                           updateItem(it, {
                             estimated_price: e.target.value === "" ? null : Number(e.target.value),
                           })
                         }
                       />
                     </TableCell>
                     <TableCell className="w-32">
                       <Switch checked={!!it.is_active} onCheckedChange={(v) => updateItem(it, { is_active: v })} />
                     </TableCell>
                     <TableCell className="w-28">
                       {savingId === it.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
