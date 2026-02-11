"use server"

import webpush from "web-push"
import { createAdminClient } from "@/lib/supabase/admin"

// Configurar VAPID apenas se as chaves existirem
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:admin@saymoncell.com.br",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

interface NotificationPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

// Envia push notification para todos os dispositivos inscritos
export async function sendPushToAll(payload: NotificationPayload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[Push] Chaves VAPID nao configuradas, notificacao ignorada")
    return
  }

  try {
    const supabase = createAdminClient()

    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")

    if (error) {
      console.error("[Push] Erro ao buscar subscriptions:", error.message)
      return
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log("[Push] Nenhuma subscription encontrada")
      return
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
          )
        } catch (err: any) {
          // Subscription expirada ou invalida - remover do banco
          if (err.statusCode === 404 || err.statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id)
            console.log(`[Push] Subscription expirada removida: ${sub.id}`)
          }
          throw err
        }
      })
    )

    const succeeded = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length
    console.log(`[Push] Enviadas: ${succeeded} sucesso, ${failed} falha(s)`)
  } catch (error) {
    console.error("[Push] Erro ao enviar notificacoes:", error)
  }
}

// -- Funcoes de notificacao por evento --

export async function notifyNewLead(customerName: string, deviceModel: string) {
  await sendPushToAll({
    title: "Novo Lead Recebido!",
    body: `${customerName} solicitou orcamento para ${deviceModel}`,
    url: "/admin/leads",
    tag: "new-lead",
  })
}

export async function notifyLowStock(productName: string, currentStock: number) {
  await sendPushToAll({
    title: "Estoque Baixo!",
    body: `${productName} - apenas ${currentStock} unidade(s) restante(s)`,
    url: "/admin/products",
    tag: `low-stock-${productName.toLowerCase().replace(/\s+/g, "-")}`,
  })
}

export async function notifyNewPurchase(customerName: string | null, total: number) {
  const name = customerName || "Cliente"
  await sendPushToAll({
    title: "Nova Compra na Loja!",
    body: `${name} fez uma compra de R$ ${total.toFixed(2)}`,
    url: "/admin/pdv",
    tag: "new-purchase",
  })
}
