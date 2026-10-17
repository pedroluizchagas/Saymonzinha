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

async function sha1Hex(str: string) {
  const data = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest("SHA-1", data)
  const bytes = Array.from(new Uint8Array(hash))
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase()
}

async function checkPwnedPassword(password: string) {
  const hash = await sha1Hex(password)
  const prefix = hash.slice(0, 5)
  const suffix = hash.slice(5)
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" },
    cache: "no-store",
  })
  const text = await res.text()
  return text.split("\n").some((line) => line.split(":")[0] === suffix)
}

function passwordPolicyError(pwd: string): string | null {
  if (pwd.length < 8) return "A senha deve ter pelo menos 8 caracteres"
  const hasRequired = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|<>?,./`~])/.test(pwd)
  if (!hasRequired) {
    return "A senha deve conter minúscula, maiúscula, dígito e símbolo"
  }
  return null
}

export default function SignUpPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    const policyErr = passwordPolicyError(password)
    if (policyErr) {
      setError(policyErr)
      setIsLoading(false)
      return
    }

    try {
      const isPwned = await checkPwnedPassword(password)
      if (isPwned) {
        setError("Esta senha já apareceu em vazamentos de dados. Escolha outra.")
        setIsLoading(false)
        return
      }
    } catch {
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
          data: {
            full_name: fullName,
            role: "technician",
          },
        },
      })
      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Erro ao criar conta")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthScreen title="Criar conta" note="Para a equipe da loja usar o painel.">
      <form onSubmit={handleSignUp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome completo</Label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Seu nome"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar a senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
              Criando a conta
            </>
          ) : (
            "Criar conta"
          )}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-sc-stone">
        Já tem conta?{" "}
        <Link href="/auth/login" className="text-sc-bone underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthScreen>
  )
}
