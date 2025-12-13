import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Smartphone } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">
              SAYMON <span className="text-primary">CELL</span>
            </span>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-accent" />
            </div>
            <CardTitle className="text-xl text-foreground">Conta Criada!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Verifique seu email para confirmar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-6">
              Enviamos um link de confirmação para o seu email. Clique no link para ativar sua conta e acessar o
              sistema.
            </p>
            <Link href="/auth/login" className="text-primary hover:underline text-sm">
              Voltar para o login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
