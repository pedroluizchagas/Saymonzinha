 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { DeviceBrand, DeviceModel } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Switch } from "@/components/ui/switch"
 import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
 import { ChevronRight, Loader2 } from "lucide-react"
 import { SettingsField, SettingsList, SettingsRow, countLabel } from "@/components/admin/settings-list"

 const BRAND_COLUMNS = "md:grid-cols-[minmax(0,1fr)_4rem_8rem_1rem]"
 const MODEL_COLUMNS = "md:grid-cols-[minmax(0,1fr)_4rem_1rem]"
 
 export function SettingsDevices() {
   const supabase = createClient()
   const [brands, setBrands] = useState<DeviceBrand[]>([])
   const [loading, setLoading] = useState(true)
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
     <Card>
       <CardHeader>
         <p className="sc-label text-sc-stone">Cadastradas</p>
         <CardTitle>{loading && brands.length === 0 ? "Carregando" : countLabel(brands.length, "marca", "marcas")}</CardTitle>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
           <div className="space-y-2">
             <Label htmlFor="marca-nome">Nova marca</Label>
             <Input id="marca-nome" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Apple" />
           </div>
           <div>
             <Button onClick={addBrand} disabled={savingId === "new"}>
               {savingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
               Adicionar
             </Button>
           </div>
         </div>
 
         <SettingsList
           head={["Marca", "Ativa", "Modelos"]}
           columns={BRAND_COLUMNS}
           loading={loading && brands.length === 0}
           empty={brands.length === 0 && "Nenhuma marca cadastrada."}
         >
           {brands.map((b) => (
             <SettingsRow key={b.id} columns={BRAND_COLUMNS} saving={savingId === b.id}>
               <SettingsField label="Marca" className="col-span-2 md:col-span-1">
                 <Input defaultValue={b.name} onBlur={(e) => updateBrand(b, { name: e.target.value })} />
               </SettingsField>
               <SettingsField label="Ativa">
                 <span className="flex h-11 items-center">
                   <Switch checked={!!b.is_active} onCheckedChange={(v) => updateBrand(b, { is_active: v })} />
                 </span>
               </SettingsField>
               <div className="flex h-11 items-center justify-end md:justify-start">
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button variant="outline" size="sm" onClick={() => openModels(b)} aria-label={`Modelos da marca ${b.name}`}>
                       Modelos
                       <ChevronRight />
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[600px]">
                     <DialogHeader>
                       <DialogTitle>Modelos · {selectedBrand?.name}</DialogTitle>
                       <DialogDescription>Os modelos da marca e quais estão ativos.</DialogDescription>
                     </DialogHeader>
                     <div className="space-y-4">
                       <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                         <div className="space-y-2">
                           <Label htmlFor="modelo-nome">Novo modelo</Label>
                           <Input
                             id="modelo-nome"
                             value={modelName}
                             onChange={(e) => setModelName(e.target.value)}
                             placeholder="Ex.: iPhone 12"
                           />
                         </div>
                         <div>
                           <Button onClick={addModel} disabled={modelSavingId === "new" || !selectedBrand}>
                             {modelSavingId === "new" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                             Adicionar
                           </Button>
                         </div>
                       </div>
 
                       <SettingsList
                         head={["Modelo", "Ativo"]}
                         columns={MODEL_COLUMNS}
                         loading={modelsLoading && models.length === 0}
                         empty={models.length === 0 && "Nenhum modelo cadastrado."}
                       >
                         {models.map((m) => (
                           <SettingsRow key={m.id} columns={MODEL_COLUMNS} saving={modelSavingId === m.id}>
                             <SettingsField label="Modelo" className="col-span-2 md:col-span-1">
                               <Input defaultValue={m.name} onBlur={(e) => updateModel(m, { name: e.target.value })} />
                             </SettingsField>
                             <SettingsField label="Ativo">
                               <span className="flex h-11 items-center">
                                 <Switch checked={!!m.is_active} onCheckedChange={(v) => updateModel(m, { is_active: v })} />
                               </span>
                             </SettingsField>
                           </SettingsRow>
                         ))}
                       </SettingsList>
                     </div>
                   </DialogContent>
                 </Dialog>
               </div>
             </SettingsRow>
           ))}
         </SettingsList>
       </CardContent>
     </Card>
   )
 }
