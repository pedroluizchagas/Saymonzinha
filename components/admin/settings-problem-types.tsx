 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { ProblemType } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Switch } from "@/components/ui/switch"
 import { Textarea } from "@/components/ui/textarea"
 import { Loader2 } from "lucide-react"
 import { SettingsField, SettingsList, SettingsRow, countLabel } from "@/components/admin/settings-list"

 const COLUMNS = "md:grid-cols-[minmax(0,1fr)_9rem_4rem_1rem]"
 
 export function SettingsProblemTypes() {
   const supabase = createClient()
   const [items, setItems] = useState<ProblemType[]>([])
   const [loading, setLoading] = useState(true)
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
     <Card>
       <CardHeader>
         <p className="sc-label text-sc-stone">Cadastrados</p>
         <CardTitle>
           {loading && items.length === 0 ? "Carregando" : countLabel(items.length, "tipo de serviço", "tipos de serviço")}
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_12rem]">
           <div className="space-y-2">
             <Label htmlFor="servico-nome">Novo tipo de serviço</Label>
             <Input id="servico-nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Troca de tela" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="servico-preco">Preço estimado (R$)</Label>
             <Input
               id="servico-preco"
               type="number"
               step="0.01"
               inputMode="decimal"
               value={estimated}
               onChange={(e) => setEstimated(e.target.value)}
               placeholder="0,00"
             />
           </div>
           <div className="space-y-2 md:col-span-2">
             <Label htmlFor="servico-descricao">Descrição</Label>
             <Textarea
               id="servico-descricao"
               value={description}
               onChange={(e) => setDescription(e.target.value)}
               placeholder="Detalhes do serviço"
             />
           </div>
           <div>
             <Button onClick={addItem} disabled={savingId === "new"}>
               {savingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
               Adicionar
             </Button>
           </div>
         </div>
 
         <SettingsList
           head={["Nome", "Preço (R$)", "Ativo"]}
           columns={COLUMNS}
           loading={loading && items.length === 0}
           empty={items.length === 0 && "Nenhum tipo de serviço cadastrado."}
         >
           {items.map((it) => (
             <SettingsRow key={it.id} columns={COLUMNS} saving={savingId === it.id}>
               <SettingsField label="Nome" className="col-span-2 md:col-span-1">
                 <Input defaultValue={it.name} onBlur={(e) => updateItem(it, { name: e.target.value })} />
               </SettingsField>
               <SettingsField label="Preço (R$)">
                 <Input
                   type="number"
                   step="0.01"
                   inputMode="decimal"
                   defaultValue={it.estimated_price !== null ? String(it.estimated_price) : ""}
                   onBlur={(e) =>
                     updateItem(it, {
                       estimated_price: e.target.value === "" ? null : Number(e.target.value),
                     })
                   }
                 />
               </SettingsField>
               <SettingsField label="Ativo">
                 <span className="flex h-11 items-center">
                   <Switch checked={!!it.is_active} onCheckedChange={(v) => updateItem(it, { is_active: v })} />
                 </span>
               </SettingsField>
             </SettingsRow>
           ))}
         </SettingsList>
       </CardContent>
     </Card>
   )
 }
