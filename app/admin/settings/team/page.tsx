 import { redirect } from "next/navigation"
 import { createClient } from "@/lib/supabase/server"
 import { AdminHeader } from "@/components/admin/header"
 import type { Profile } from "@/types/database"
 import { SettingsTeam } from "@/components/admin/settings-team"
 
 export default async function SettingsTeamPage() {
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
         title="Equipe"
         subtitle="Configurações · quem usa o painel e com qual função"
       />
 
       <div className="px-4 pb-6 md:px-8">
         <SettingsTeam />
       </div>
     </div>
   )
 }
