 import { redirect } from "next/navigation"
 import { createClient } from "@/lib/supabase/server"
 import { AdminHeader } from "@/components/admin/header"
 import type { Profile } from "@/types/database"
 import { SettingsDevices } from "@/components/admin/settings-devices"
 
 export default async function SettingsDevicesPage() {
   const supabase = await createClient()
 
   const {
     data: { user },
   } = await supabase.auth.getUser()
 
   if (!user) redirect("/auth/login")
 
   const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
 
   return (
     <div>
       <AdminHeader
         user={profile as Profile | null}
         title="Marcas e Modelos"
         subtitle="Cadastre e gerencie aparelhos atendidos"
       />
 
       <div className="p-6">
         <SettingsDevices />
       </div>
     </div>
   )
 }
