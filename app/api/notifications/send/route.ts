import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { sendNotification } from "@/lib/notifications"
import type { NotificationType } from "@/types/database"

// POST /api/notifications/send
// Permite enviar notificacoes programaticamente (requer autenticacao admin)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nao autenticado" },
        { status: 401 }
      )
    }

    // Verificar se e admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Sem permissao" },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.title || !body.body) {
      return NextResponse.json(
        { error: "Campos title e body sao obrigatorios" },
        { status: 400 }
      )
    }

    const result = await sendNotification({
      type: (body.type as NotificationType) || "system",
      title: body.title,
      body: body.body,
      url: body.url || "/admin",
      tag: body.tag || "system",
      metadata: body.metadata || {},
    })

    return NextResponse.json({
      success: true,
      notification_id: result?.id || null,
    })
  } catch (error) {
    console.error("[API Send Notification] Erro:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
