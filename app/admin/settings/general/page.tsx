 import { redirect } from "next/navigation"
 import { createClient } from "@/lib/supabase/server"
 import { AdminHeader } from "@/components/admin/header"
 import type { Profile } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
 
 export default async function SettingsGeneralPage() {
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
         title="Configurações Gerais"
         subtitle="Preferências do sistema e da loja"
       />
 
       <div className="p-6">
         <Card className="bg-card border-border max-w-3xl">
           <CardHeader>
             <CardTitle className="text-foreground">Em breve</CardTitle>
             <CardDescription className="text-muted-foreground">
               Aqui você poderá configurar nome da loja, endereço, tema, integrações e outras preferências.
             </CardDescription>
           </CardHeader>
           <CardContent></CardContent>
         </Card>
       </div>
     </div>
   )
 }
