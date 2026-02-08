 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { DeviceBrand, DeviceModel } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
 import { Switch } from "@/components/ui/switch"
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
 import { Loader2, Smartphone, Plus } from "lucide-react"
 
 export function SettingsDevices() {
   const supabase = createClient()
   const [brands, setBrands] = useState<DeviceBrand[]>([])
   const [loading, setLoading] = useState(false)
   const [name, setName] = useState("")
   const [savingId, setSavingId] = useState<string | null>(null)
 
   const [selectedBrand, setSelectedBrand] = useState<DeviceBrand | null>(null)
   const [models, setModels] = useState<DeviceModel[]>([])
   const [modelName, setModelName] = useState("")
   const [modelsLoading, setModelsLoading] = useState(false)
   const [modelSavingId, setModelSavingId] = useState<string | null>(null)
 
   const loadBrands = async () => {
     setLoading(true)
     const { data } = await supabase.from("device_brands").select("*").order("name")
     setBrands((data as DeviceBrand[]) || [])
     setLoading(false)
   }
 
   useEffect(() => {
     loadBrands()
   }, [])
 
   const addBrand = async () => {
     if (!name.trim()) return
     setSavingId("new")
     await supabase.from("device_brands").insert({ name: name.trim(), is_active: true })
     setName("")
     setSavingId(null)
     loadBrands()
   }
 
   const updateBrand = async (b: DeviceBrand, changes: Partial<DeviceBrand>) => {
     setSavingId(b.id)
     await supabase.from("device_brands").update(changes).eq("id", b.id)
     setSavingId(null)
     loadBrands()
   }
 
   const openModels = async (b: DeviceBrand) => {
     setSelectedBrand(b)
     setModelsLoading(true)
     const { data } = await supabase.from("device_models").select("*").eq("brand_id", b.id).order("name")
     setModels((data as DeviceModel[]) || [])
     setModelsLoading(false)
   }
 
   const addModel = async () => {
     if (!selectedBrand || !modelName.trim()) return
     setModelSavingId("new")
     await supabase
       .from("device_models")
       .insert({ brand_id: selectedBrand.id, name: modelName.trim(), is_active: true })
     setModelName("")
     setModelSavingId(null)
     openModels(selectedBrand)
   }
 
   const updateModel = async (m: DeviceModel, changes: Partial<DeviceModel>) => {
     setModelSavingId(m.id)
     await supabase.from("device_models").update(changes).eq("id", m.id)
     setModelSavingId(null)
     if (selectedBrand) openModels(selectedBrand)
   }
 
   return (
     <Card className="bg-card border-border">
       <CardHeader>
         <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-lg">
             <Smartphone className="w-5 h-5 text-primary" />
           </div>
           <CardTitle className="text-lg text-foreground">Marcas e Modelos</CardTitle>
         </div>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
           <div className="space-y-2 md:col-span-2">
             <Label className="text-foreground">Nova marca</Label>
             <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Apple" />
           </div>
           <div className="flex items-end">
             <Button onClick={addBrand} disabled={savingId === "new"}>
               {savingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
               Adicionar
             </Button>
           </div>
         </div>
 
         <div className="border border-border rounded-lg overflow-hidden">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Marca</TableHead>
                 <TableHead>Ativa</TableHead>
                 <TableHead>Modelos</TableHead>
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
               ) : brands.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={4} className="text-muted-foreground">
                     Nenhuma marca cadastrada
                   </TableCell>
                 </TableRow>
               ) : (
                 brands.map((b) => (
                   <TableRow key={b.id}>
                     <TableCell>
                       <Input defaultValue={b.name} onBlur={(e) => updateBrand(b, { name: e.target.value })} />
                     </TableCell>
                     <TableCell className="w-32">
                       <Switch checked={!!b.is_active} onCheckedChange={(v) => updateBrand(b, { is_active: v })} />
                     </TableCell>
                     <TableCell className="w-40">
                       <Dialog>
                         <DialogTrigger asChild>
                           <Button variant="outline" size="sm" onClick={() => openModels(b)}>
                             <Plus className="w-4 h-4 mr-2" />
                             Gerenciar
                           </Button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-[600px] bg-card border-border">
                           <DialogHeader>
                             <DialogTitle>Modelos - {selectedBrand?.name}</DialogTitle>
                           </DialogHeader>
                           <div className="space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                               <div className="space-y-2 md:col-span-2">
                                 <Label className="text-foreground">Novo modelo</Label>
                                 <Input value={modelName} onChange={(e) => setModelName(e.target.value)} placeholder="Ex.: iPhone 12" />
                               </div>
                               <div className="flex items-end">
                                 <Button onClick={addModel} disabled={modelSavingId === "new" || !selectedBrand}>
                                   {modelSavingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                   Adicionar
                                 </Button>
                               </div>
                             </div>
 
                             <div className="border border-border rounded-lg overflow-hidden">
                               <Table>
                                 <TableHeader>
                                   <TableRow>
                                     <TableHead>Modelo</TableHead>
                                     <TableHead>Ativo</TableHead>
                                     <TableHead></TableHead>
                                   </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                   {modelsLoading ? (
                                     <TableRow>
                                       <TableCell colSpan={3}>
                                         <div className="flex items-center gap-2">
                                           <Loader2 className="w-4 h-4 animate-spin" />
                                           Carregando...
                                         </div>
                                       </TableCell>
                                     </TableRow>
                                   ) : models.length === 0 ? (
                                     <TableRow>
                                       <TableCell colSpan={3} className="text-muted-foreground">
                                         Nenhum modelo cadastrado
                                       </TableCell>
                                     </TableRow>
                                   ) : (
                                     models.map((m) => (
                                       <TableRow key={m.id}>
                                         <TableCell>
                                           <Input defaultValue={m.name} onBlur={(e) => updateModel(m, { name: e.target.value })} />
                                         </TableCell>
                                         <TableCell className="w-32">
                                           <Switch checked={!!m.is_active} onCheckedChange={(v) => updateModel(m, { is_active: v })} />
                                         </TableCell>
                                         <TableCell className="w-28">
                                           {modelSavingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                         </TableCell>
                                       </TableRow>
                                     ))
                                   )}
                                 </TableBody>
                               </Table>
                             </div>
                           </div>
                           <DialogFooter></DialogFooter>
                         </DialogContent>
                       </Dialog>
                     </TableCell>
                     <TableCell className="w-28">
                       {savingId === b.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
