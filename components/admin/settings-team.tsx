 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { Profile, UserRole } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Input } from "@/components/ui/input"
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
 import { Switch } from "@/components/ui/switch"
 import { ROLE_LABELS } from "@/components/admin/avatar"
 import { SettingsField, SettingsList, SettingsRow, countLabel } from "@/components/admin/settings-list"
 
 const ROLES: UserRole[] = ["admin", "technician", "attendant"]
 const COLUMNS = "md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_11rem_8rem_4rem_1rem]"
 
 export function SettingsTeam() {
   const supabase = createClient()
   const [profiles, setProfiles] = useState<Profile[]>([])
   const [loading, setLoading] = useState(true)
   const [savingId, setSavingId] = useState<string | null>(null)
   const [errorMsg, setErrorMsg] = useState<string | null>(null)
 
   const load = async () => {
     setLoading(true)
     setErrorMsg(null)
     const { data, error } = await supabase.from("profiles").select("*").order("full_name")
     if (error) {
       setErrorMsg("Não foi possível carregar a equipe. Verifique permissões (apenas administradores).")
     }
     setProfiles((data as Profile[]) || [])
     setLoading(false)
   }
 
   useEffect(() => {
     load()
   }, [])
 
   const updateProfile = async (p: Profile, changes: Partial<Profile>) => {
     setSavingId(p.id)
     const { error } = await supabase.from("profiles").update(changes).eq("id", p.id)
     if (error) {
       setErrorMsg(error.message)
     } else {
       setErrorMsg(null)
     }
     setSavingId(null)
     load()
   }
 
   return (
     <Card>
       <CardHeader>
         <p className="sc-label text-sc-stone">Com acesso ao painel</p>
         <CardTitle>{loading && profiles.length === 0 ? "Carregando" : countLabel(profiles.length, "pessoa", "pessoas")}</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {errorMsg ? (
           <p role="alert" className="rounded-[10px] bg-sc-ember px-3 py-2 text-sm text-sc-bone">
             {errorMsg}
           </p>
         ) : null}
         <SettingsList
           head={["Nome", "Telefone", "Função", "Comissão (%)", "Ativo"]}
           columns={COLUMNS}
           loading={loading && profiles.length === 0}
           empty={profiles.length === 0 && "Ninguém cadastrado ainda."}
         >
           {profiles.map((p) => (
             <SettingsRow key={p.id} columns={COLUMNS} saving={savingId === p.id}>
               <SettingsField label="Nome" className="col-span-2 md:col-span-1">
                 <Input defaultValue={p.full_name} onBlur={(e) => updateProfile(p, { full_name: e.target.value })} />
               </SettingsField>
               <SettingsField label="Telefone" className="col-span-2 md:col-span-1">
                 <Input
                   type="tel"
                   defaultValue={p.phone ?? ""}
                   onBlur={(e) => updateProfile(p, { phone: e.target.value })}
                 />
               </SettingsField>
               <SettingsField label="Função">
                 <Select defaultValue={p.role} onValueChange={(v) => updateProfile(p, { role: v as UserRole })}>
                   <SelectTrigger>
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     {ROLES.map((r) => (
                       <SelectItem key={r} value={r}>
                         {ROLE_LABELS[r]}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </SettingsField>
               <SettingsField label="Comissão (%)">
                 <Input
                   type="number"
                   step="0.01"
                   inputMode="decimal"
                   defaultValue={String(p.commission_rate ?? 0)}
                   onBlur={(e) => updateProfile(p, { commission_rate: Number(e.target.value) || 0 })}
                 />
               </SettingsField>
               <SettingsField label="Ativo">
                 <span className="flex h-11 items-center">
                   <Switch checked={!!p.is_active} onCheckedChange={(v) => updateProfile(p, { is_active: v })} />
                 </span>
               </SettingsField>
             </SettingsRow>
           ))}
         </SettingsList>
       </CardContent>
     </Card>
   )
 }
