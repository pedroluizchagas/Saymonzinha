"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { AuthScreen } from "@/components/admin/auth-screen"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/admin")
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao fazer login"
      if (typeof msg === "string" && /WeakPasswordError/i.test(msg)) {
        setError("Sua senha não atende à nova política de segurança. Atualize a senha.")
      } else {
        setError(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthScreen title="Entrar" note="Use o e-mail e a senha da equipe.">
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="voce@saymoncell.com.br"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-[14px] border border-sc-red/40 bg-sc-ember px-3.5 py-3 text-sm text-sc-bone">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Entrando
            </>
          ) : (
            "Entrar"
          )}
        </Button>
      </form>

      <Link href="/" className="mt-5 block text-center text-sm text-sc-stone transition-colors hover:text-sc-bone">
        Voltar para o site
      </Link>
    </AuthScreen>
  )
}
