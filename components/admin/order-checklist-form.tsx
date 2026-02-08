 "use client"
 
 import { useState } from "react"
 import { Button } from "@/components/ui/button"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Label } from "@/components/ui/label"
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
 import { Textarea } from "@/components/ui/textarea"
 import type { EntryChecklist } from "@/types/database"
 import { updateServiceOrder } from "@/lib/actions/service-order-actions"
 import { Loader2 } from "lucide-react"
 import { useRouter } from "next/navigation"
 
 interface OrderChecklistFormProps {
   orderId: string
   initialChecklist: EntryChecklist | null
 }
 
 type TriState = "true" | "false" | "null"
 
 const toTriState = (v: boolean | null | undefined): TriState => {
   if (v === true) return "true"
   if (v === false) return "false"
   return "null"
 }
 
 const fromTriState = (v: TriState): boolean | null => {
   if (v === "true") return true
   if (v === "false") return false
   return null
 }
 
 export function OrderChecklistForm({ orderId, initialChecklist }: OrderChecklistFormProps) {
   const router = useRouter()
   const [saving, setSaving] = useState(false)
 
   const [screenCondition, setScreenCondition] = useState<"ok" | "cracked" | "broken" | null>(
     initialChecklist?.screen_condition ?? null,
   )
   const [turnsOn, setTurnsOn] = useState<TriState>(toTriState(initialChecklist?.turns_on))
   const [touchWorks, setTouchWorks] = useState<TriState>(toTriState(initialChecklist?.touch_works))
   const [camerasWork, setCamerasWork] = useState<TriState>(toTriState(initialChecklist?.cameras_work))
   const [buttonsWork, setButtonsWork] = useState<TriState>(toTriState(initialChecklist?.buttons_work))
   const [chargingPortOk, setChargingPortOk] = useState<TriState>(toTriState(initialChecklist?.charging_port_ok))
   const [speakersOk, setSpeakersOk] = useState<TriState>(toTriState(initialChecklist?.speakers_ok))
   const [microphoneOk, setMicrophoneOk] = useState<TriState>(toTriState(initialChecklist?.microphone_ok))
   const [physicalDamage, setPhysicalDamage] = useState(initialChecklist?.physical_damage ?? "")
   const [accessoriesReceived, setAccessoriesReceived] = useState(initialChecklist?.accessories_received ?? "")
   const [notes, setNotes] = useState(initialChecklist?.notes ?? "")
 
   const handleSave = async () => {
     setSaving(true)
     const payload: EntryChecklist = {
       screen_condition: screenCondition,
       turns_on: fromTriState(turnsOn),
       touch_works: fromTriState(touchWorks),
       cameras_work: fromTriState(camerasWork),
       buttons_work: fromTriState(buttonsWork),
       charging_port_ok: fromTriState(chargingPortOk),
       speakers_ok: fromTriState(speakersOk),
       microphone_ok: fromTriState(microphoneOk),
       physical_damage: physicalDamage || null,
       accessories_received: accessoriesReceived || null,
       notes: notes || null,
     }
 
     const result = await updateServiceOrder(orderId, { entry_checklist: payload })
     setSaving(false)
     if (result.success) {
       router.refresh()
     }
   }
 
   return (
     <Card className="bg-card border-border">
       <CardHeader>
         <CardTitle className="text-lg text-foreground">Checklist de Entrada (Editar)</CardTitle>
       </CardHeader>
       <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <div className="space-y-2">
           <Label>Condição da Tela</Label>
           <Select
             value={screenCondition ?? "null"}
             onValueChange={(v) => setScreenCondition(v === "null" ? null : (v as "ok" | "cracked" | "broken"))}
           >
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="ok">Sem dano</SelectItem>
               <SelectItem value="cracked">Trincada</SelectItem>
               <SelectItem value="broken">Quebrada</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="space-y-2">
           <Label>Liga</Label>
           <Select value={turnsOn} onValueChange={(v: TriState) => setTurnsOn(v)}>
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="true">Sim</SelectItem>
               <SelectItem value="false">Não</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="space-y-2">
           <Label>Touch</Label>
           <Select value={touchWorks} onValueChange={(v: TriState) => setTouchWorks(v)}>
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="true">Funciona</SelectItem>
               <SelectItem value="false">Não funciona</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="space-y-2">
           <Label>Câmeras</Label>
           <Select value={camerasWork} onValueChange={(v: TriState) => setCamerasWork(v)}>
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="true">Funcionam</SelectItem>
               <SelectItem value="false">Não funcionam</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="space-y-2">
           <Label>Botões</Label>
           <Select value={buttonsWork} onValueChange={(v: TriState) => setButtonsWork(v)}>
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="true">Funcionam</SelectItem>
               <SelectItem value="false">Não funcionam</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="space-y-2">
           <Label>Conector de Carga</Label>
           <Select value={chargingPortOk} onValueChange={(v: TriState) => setChargingPortOk(v)}>
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="true">OK</SelectItem>
               <SelectItem value="false">Com problema</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="space-y-2">
           <Label>Alto-falantes</Label>
           <Select value={speakersOk} onValueChange={(v: TriState) => setSpeakersOk(v)}>
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="true">OK</SelectItem>
               <SelectItem value="false">Com problema</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="space-y-2">
           <Label>Microfone</Label>
           <Select value={microphoneOk} onValueChange={(v: TriState) => setMicrophoneOk(v)}>
             <SelectTrigger className="bg-background">
               <SelectValue placeholder="Selecione" />
             </SelectTrigger>
             <SelectContent className="bg-popover border-border">
               <SelectItem value="null">Indefinido</SelectItem>
               <SelectItem value="true">OK</SelectItem>
               <SelectItem value="false">Com problema</SelectItem>
             </SelectContent>
           </Select>
         </div>
 
         <div className="md:col-span-2 space-y-2">
           <Label>Danos físicos</Label>
           <Textarea
             value={physicalDamage}
             onChange={(e) => setPhysicalDamage(e.target.value)}
             placeholder="Descreva arranhões, amassados, trincos, etc."
             className="min-h-20 bg-background"
           />
         </div>
 
         <div className="md:col-span-2 space-y-2">
           <Label>Acessórios recebidos</Label>
           <Textarea
             value={accessoriesReceived}
             onChange={(e) => setAccessoriesReceived(e.target.value)}
             placeholder="Capas, carregadores, cartões, etc."
             className="min-h-20 bg-background"
           />
         </div>
 
         <div className="md:col-span-2 space-y-2">
           <Label>Observações</Label>
           <Textarea
             value={notes}
             onChange={(e) => setNotes(e.target.value)}
             placeholder="Observações adicionais"
             className="min-h-20 bg-background"
           />
         </div>
 
         <div className="md:col-span-2 flex justify-end">
           <Button onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
             {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
             Salvar checklist
           </Button>
         </div>
       </CardContent>
     </Card>
   )
 }
 
