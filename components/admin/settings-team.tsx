 "use client"
 
 import { useEffect, useState } from "react"
 import { createClient } from "@/lib/supabase/client"
 import type { Profile, UserRole } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
 import { Input } from "@/components/ui/input"
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
 import { Switch } from "@/components/ui/switch"
 import { Loader2, Users } from "lucide-react"
 
 const ROLES: UserRole[] = ["admin", "technician", "attendant"]
 
 export function SettingsTeam() {
   const supabase = createClient()
   const [profiles, setProfiles] = useState<Profile[]>([])
   const [loading, setLoading] = useState(false)
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
     <Card className="bg-card border-border">
       <CardHeader>
         <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-lg">
             <Users className="w-5 h-5 text-primary" />
           </div>
           <CardTitle className="text-lg text-foreground">Equipe</CardTitle>
         </div>
       </CardHeader>
       <CardContent>
         {errorMsg ? <p className="text-sm text-red-600 mb-4">{errorMsg}</p> : null}
         <div className="border border-border rounded-lg overflow-hidden">
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Nome</TableHead>
                 <TableHead>Telefone</TableHead>
                 <TableHead>Função</TableHead>
                 <TableHead>Comissão (%)</TableHead>
                 <TableHead>Ativo</TableHead>
                 <TableHead></TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {loading ? (
                 <TableRow>
                   <TableCell colSpan={6}>
                     <div className="flex items-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       Carregando...
                     </div>
                   </TableCell>
                 </TableRow>
               ) : profiles.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={6} className="text-muted-foreground">
                     Nenhum usuário encontrado
                   </TableCell>
                 </TableRow>
               ) : (
                 profiles.map((p) => (
                   <TableRow key={p.id}>
                     <TableCell>
                       <Input defaultValue={p.full_name} onBlur={(e) => updateProfile(p, { full_name: e.target.value })} />
                     </TableCell>
                     <TableCell>
                       <Input defaultValue={p.phone ?? ""} onBlur={(e) => updateProfile(p, { phone: e.target.value })} />
                     </TableCell>
                     <TableCell className="w-56">
                       <Select defaultValue={p.role} onValueChange={(v) => updateProfile(p, { role: v as UserRole })}>
                         <SelectTrigger className="bg-background border-input">
                           <SelectValue />
                         </SelectTrigger>
                         <SelectContent>
                           {ROLES.map((r) => (
                             <SelectItem key={r} value={r}>
                               {r}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </TableCell>
                     <TableCell className="w-40">
                       <Input
                         type="number"
                         step="0.01"
                         defaultValue={String(p.commission_rate ?? 0)}
                         onBlur={(e) => updateProfile(p, { commission_rate: Number(e.target.value) || 0 })}
                       />
                     </TableCell>
                     <TableCell className="w-32">
                       <Switch checked={!!p.is_active} onCheckedChange={(v) => updateProfile(p, { is_active: v })} />
                     </TableCell>
                     <TableCell className="w-28">
                       {savingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
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
