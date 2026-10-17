 import { redirect } from "next/navigation"
 import { createClient } from "@/lib/supabase/server"
 import { AdminHeader } from "@/components/admin/header"
 import { NewCustomerForm } from "@/components/admin/new-customer-form"
 import type { Profile } from "@/types/database"
 
 export default async function NewCustomerPage() {
   const supabase = await createClient()
 
   const {
     data: { user },
   } = await supabase.auth.getUser()
 
   if (!user) redirect("/auth/login")
 
   const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
 
   return (
     <div>
       <AdminHeader user={profile as Profile | null} title="Novo cliente" subtitle="Clientes · cadastro" />
 
       <div className="px-4 pb-6 md:px-8">
         <NewCustomerForm />
       </div>
     </div>
   )
 }
