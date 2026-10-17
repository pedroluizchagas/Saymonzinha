import Link from "next/link"
import { AuthScreen } from "@/components/admin/auth-screen"

export default function SignUpSuccessPage() {
  return (
    <AuthScreen title="Conta criada" note="Falta confirmar o e-mail.">
      <p className="text-sm leading-[1.5] text-sc-bone">
        Enviamos um link de confirmação para o seu e-mail. Abra o link para ativar a conta e entrar no painel.
      </p>
      <Link href="/auth/login" className="mt-5 block text-center text-sm text-sc-stone transition-colors hover:text-sc-bone">
        Voltar para o login
      </Link>
    </AuthScreen>
  )
}
