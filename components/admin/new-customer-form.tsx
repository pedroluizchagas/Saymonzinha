 "use client"
 
 import { useState } from "react"
 import { useRouter } from "next/navigation"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Textarea } from "@/components/ui/textarea"
 import { Loader2, UserPlus } from "lucide-react"
 import { createCustomer } from "@/lib/actions/customer-actions"
 
 export function NewCustomerForm() {
   const router = useRouter()
   const [name, setName] = useState("")
   const [phone, setPhone] = useState("")
   const [email, setEmail] = useState("")
   const [address, setAddress] = useState("")
   const [notes, setNotes] = useState("")
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [error, setError] = useState<string | null>(null)
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault()
     setIsSubmitting(true)
     setError(null)
 
     if (!name.trim() || !phone.trim()) {
       setError("Informe nome e telefone")
       setIsSubmitting(false)
       return
     }
 
     const result = await createCustomer({
       name: name.trim(),
       phone: phone.trim(),
       email: email.trim() || undefined,
       address: address.trim() || undefined,
       notes: notes.trim() || undefined,
     })
 
     if (!result.success) {
       setError(result.message || "Erro ao cadastrar cliente")
       setIsSubmitting(false)
       return
     }
 
     router.push("/admin/customers")
   }
 
   return (
     <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
       <Card className="bg-card border-border">
         <CardHeader>
           <CardTitle className="text-lg text-foreground flex items-center gap-2">
             <UserPlus className="w-5 h-5" />
             Dados do Cliente
           </CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           {error && <div className="text-sm text-destructive">{error}</div>}
 
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label className="text-foreground">Nome *</Label>
               <Input
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="bg-background border-input"
                 required
               />
             </div>
             <div className="space-y-2">
               <Label className="text-foreground">Telefone *</Label>
               <Input
                 value={phone}
                 onChange={(e) => setPhone(e.target.value)}
                 className="bg-background border-input"
                 required
               />
             </div>
           </div>
 
           <div className="space-y-2">
             <Label className="text-foreground">Email</Label>
             <Input
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               className="bg-background border-input"
             />
           </div>
 
           <div className="space-y-2">
             <Label className="text-foreground">Endereço</Label>
             <Input
               value={address}
               onChange={(e) => setAddress(e.target.value)}
               className="bg-background border-input"
             />
           </div>
 
           <div className="space-y-2">
             <Label className="text-foreground">Observações</Label>
             <Textarea
               value={notes}
               onChange={(e) => setNotes(e.target.value)}
               className="bg-background border-input"
             />
           </div>
 
           <div className="flex justify-end">
             <Button type="submit" disabled={isSubmitting}>
               {isSubmitting ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Cadastrando...
                 </>
               ) : (
                 <>Cadastrar Cliente</>
               )}
             </Button>
           </div>
         </CardContent>
       </Card>
     </form>
   )
 }
