 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { PaymentMethod } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Switch } from "@/components/ui/switch"
 import { Loader2 } from "lucide-react"
 import { SettingsField, SettingsList, SettingsRow, countLabel } from "@/components/admin/settings-list"

 const COLUMNS = "md:grid-cols-[minmax(0,1fr)_9rem_4rem_1rem]"
 
 export function SettingsPaymentMethods() {
   const supabase = createClient()
   const [methods, setMethods] = useState<PaymentMethod[]>([])
   const [loading, setLoading] = useState(true)
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
     <Card>
       <CardHeader>
         <p className="sc-label text-sc-stone">Cadastradas</p>
         <CardTitle>
           {loading && methods.length === 0 ? "Carregando" : countLabel(methods.length, "forma de pagamento", "formas de pagamento")}
         </CardTitle>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_9rem_auto]">
           <div className="space-y-2">
             <Label htmlFor="pagamento-nome">Nova forma de pagamento</Label>
             <Input id="pagamento-nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cartão de crédito 2x" />
           </div>
           <div className="space-y-2">
             <Label htmlFor="pagamento-taxa">Taxa (%)</Label>
             <Input
               id="pagamento-taxa"
               type="number"
               step="0.01"
               inputMode="decimal"
               value={fee}
               onChange={(e) => setFee(e.target.value)}
               placeholder="0,00"
             />
           </div>
           <div>
             <Button onClick={addMethod} disabled={savingId === "new"}>
               {savingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
               Adicionar
             </Button>
           </div>
         </div>
 
         <SettingsList
           head={["Nome", "Taxa (%)", "Ativa"]}
           columns={COLUMNS}
           loading={loading && methods.length === 0}
           empty={methods.length === 0 && "Nenhuma forma de pagamento cadastrada."}
         >
           {methods.map((m) => (
             <SettingsRow key={m.id} columns={COLUMNS} saving={savingId === m.id}>
               <SettingsField label="Nome" className="col-span-2 md:col-span-1">
                 <Input defaultValue={m.name} onBlur={(e) => updateMethod(m, { name: e.target.value })} />
               </SettingsField>
               <SettingsField label="Taxa (%)">
                 <Input
                   type="number"
                   step="0.01"
                   inputMode="decimal"
                   defaultValue={String(m.fee_percentage ?? 0)}
                   onBlur={(e) => updateMethod(m, { fee_percentage: Number(e.target.value) || 0 })}
                 />
               </SettingsField>
               <SettingsField label="Ativa">
                 <span className="flex h-11 items-center">
                   <Switch checked={!!m.is_active} onCheckedChange={(v) => updateMethod(m, { is_active: v })} />
                 </span>
               </SettingsField>
             </SettingsRow>
           ))}
         </SettingsList>
       </CardContent>
     </Card>
   )
 }
