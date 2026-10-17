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
         title="Formas de pagamento"
         subtitle="Configurações · como a loja recebe e as taxas"
       />
 
       <div className="px-4 pb-6 md:px-8">
         <SettingsPaymentMethods />
       </div>
     </div>
   )
 }
