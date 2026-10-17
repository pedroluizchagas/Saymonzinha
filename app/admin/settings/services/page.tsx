 import { redirect } from "next/navigation"
 import { createClient } from "@/lib/supabase/server"
 import { AdminHeader } from "@/components/admin/header"
 import type { Profile } from "@/types/database"
 import { SettingsProblemTypes } from "@/components/admin/settings-problem-types"
 
 export default async function SettingsServicesPage() {
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
         title="Tipos de serviço"
         subtitle="Configurações · os consertos e os preços estimados"
       />
 
       <div className="px-4 pb-6 md:px-8">
         <SettingsProblemTypes />
       </div>
     </div>
   )
 }
