 "use client"
 
 import { useEffect, useState } from "react"
 import Image from "next/image"
 import { createClient } from "@/lib/supabase/client"
 import type { Profile } from "@/types/database"
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
 import { Button } from "@/components/ui/button"
 import { Input } from "@/components/ui/input"
 import { Label } from "@/components/ui/label"
 import { Loader2, User } from "lucide-react"
 
 interface ProfileSettingsProps {
   profile: Profile
 }
 
  export function ProfileSettings({ profile }: ProfileSettingsProps) {
   const [fullName, setFullName] = useState(profile.full_name || "")
   const [phone, setPhone] = useState(profile.phone || "")
   const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
   const [avatarFile, setAvatarFile] = useState<File | null>(null)
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
 
   const supabase = createClient()
 
   useEffect(() => {
     const run = async () => {
       if (!profile.avatar_url) {
         setAvatarPreview(null)
         return
       }
       if (profile.avatar_url.startsWith("http")) {
         setAvatarPreview(profile.avatar_url)
         return
       }
       const { data } = await supabase.storage.from("avatar_profire").createSignedUrl(profile.avatar_url, 3600)
       setAvatarPreview(data?.signedUrl || null)
     }
     run()
   }, [profile.avatar_url])
 
   const onSelectAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0] || null
     setAvatarFile(file || null)
     if (file) {
       const url = URL.createObjectURL(file)
       setAvatarPreview(url)
     }
   }
 
   const handleSave = async () => {
     try {
       setIsSubmitting(true)
       setMessage(null)
 
       let avatar_url = profile.avatar_url
 
       if (avatarFile) {
         const ext = avatarFile.name.split(".").pop() || "jpg"
         const path = `avatars/${profile.id}.${ext}`
 
         const { error: uploadErr } = await supabase.storage
           .from("avatar_profire")
           .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type })
 
         if (uploadErr) {
           throw uploadErr
         }
 
         avatar_url = path
       }
 
       const { error: updateErr } = await supabase
         .from("profiles")
         .update({ full_name: fullName, phone, avatar_url })
         .eq("id", profile.id)
 
       if (updateErr) {
         throw updateErr
       }
 
       setMessage({ type: "success", text: "Perfil atualizado com sucesso." })
     } catch (err: any) {
       setMessage({ type: "error", text: err.message || "Erro ao atualizar perfil." })
     } finally {
       setIsSubmitting(false)
     }
   }
 
   return (
     <Card className="bg-card border-border mb-6 max-w-3xl">
       <CardHeader>
         <div className="flex items-center gap-3">
           <div className="p-2 bg-primary/10 rounded-lg">
             <User className="w-5 h-5 text-primary" />
           </div>
           <CardTitle className="text-lg text-foreground">Meu Perfil</CardTitle>
         </div>
       </CardHeader>
       <CardContent className="space-y-6">
         <div className="flex items-center gap-4">
           {avatarPreview ? (
             <Image src={avatarPreview} alt="Avatar" width={72} height={72} className="rounded-full object-cover" />
           ) : (
             <div className="w-18 h-18 rounded-full bg-primary/10 flex items-center justify-center">
               <span className="text-primary font-semibold text-xl">{fullName?.charAt(0) || "U"}</span>
             </div>
           )}
           <div>
             <Label className="block text-foreground mb-2">Foto do perfil</Label>
             <Input type="file" accept="image/*" onChange={onSelectAvatar} />
             <p className="text-xs text-muted-foreground mt-2">Formatos aceitos: PNG, JPG. Tamanho recomendado: 256x256.</p>
           </div>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-2">
             <Label className="text-foreground">Nome completo</Label>
             <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Seu nome" />
           </div>
           <div className="space-y-2">
             <Label className="text-foreground">Telefone</Label>
             <Input value={phone ?? ""} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 90000-0000" />
           </div>
         </div>
 
         <div className="flex items-center gap-3">
           <Button onClick={handleSave} disabled={isSubmitting}>
             {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
             Salvar alterações
           </Button>
           {message ? (
             <span
               className={`text-sm ${
                 message.type === "success" ? "text-green-600" : "text-red-600"
               }`}
             >
               {message.text}
             </span>
           ) : null}
         </div>
       </CardContent>
     </Card>
   )
 }
