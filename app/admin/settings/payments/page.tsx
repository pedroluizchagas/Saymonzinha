 import { redirect } from "next/navigation"
 import { createClient } from "@/lib/supabase/server"
 import { AdminHeader } from "@/components/admin/header"
 import type { Profile } from "@/types/database"
 import { SettingsPaymentMethods } from "@/components/admin/settings-payment-methods"
 
 export default async function SettingsPaymentsPage() {
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
         title="Formas de Pagamento"
         subtitle="Adicione e gerencie os métodos de pagamento"
       />
 
       <div className="p-6">
         <SettingsPaymentMethods />
       </div>
     </div>
   )
 }
