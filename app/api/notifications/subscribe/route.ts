import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const { subscription } = await request.json()

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Subscription invalida" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        { onConflict: "endpoint" }
      )

    if (error) {
      console.error("[Subscribe] Erro ao salvar:", error.message)
      return NextResponse.json(
        { error: "Erro ao salvar subscription" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Subscribe] Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint obrigatorio" },
        { status: 400 }
      )
    }

    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[Unsubscribe] Erro interno:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
