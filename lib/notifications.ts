"use server"

import webpush from "web-push"
import { createAdminClient } from "@/lib/supabase/admin"
import type { NotificationType } from "@/types/database"

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
  type?: NotificationType
  metadata?: Record<string, unknown>
}

// Persiste notificacao no banco de dados
async function persistNotification(payload: NotificationPayload) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        type: payload.type || "system",
        title: payload.title,
        body: payload.body,
        url: payload.url || "/admin",
        metadata: payload.metadata || {},
      })
      .select("id")
      .single()

    if (error) {
      console.error("[Notification] Erro ao persistir:", error.message)
      return null
    }

    return data
  } catch (error) {
    console.error("[Notification] Erro inesperado ao persistir:", error)
    return null
  }
}

// Envia push notification para todos os dispositivos inscritos
async function sendPushToAll(payload: NotificationPayload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("[Push] Chaves VAPID nao configuradas, push ignorado")
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

    const pushPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || "/admin",
      tag: payload.tag || "default",
    })

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
          await webpush.sendNotification(pushSubscription, pushPayload)
        } catch (err: unknown) {
          const pushErr = err as { statusCode?: number }
          // Subscription expirada ou invalida - remover do banco
          if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
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

// Funcao principal: persiste no banco E envia push
export async function sendNotification(payload: NotificationPayload) {
  // Persiste no banco (para o sininho/dropdown)
  const saved = await persistNotification(payload)

  // Envia push para dispositivos (para barra de notificacoes do celular)
  await sendPushToAll(payload)

  return saved
}

// -- Funcoes de notificacao por evento --

export async function notifyNewLead(customerName: string, deviceModel: string) {
  await sendNotification({
    type: "new_lead",
    title: "Novo Lead Recebido!",
    body: `${customerName} solicitou orcamento para ${deviceModel}`,
    url: "/admin/leads",
    tag: "new-lead",
    metadata: { customer_name: customerName, device_model: deviceModel },
  })
}

export async function notifyLowStock(productName: string, currentStock: number) {
  await sendNotification({
    type: "low_stock",
    title: "Estoque Baixo!",
    body: `${productName} - apenas ${currentStock} unidade(s) restante(s)`,
    url: "/admin/products",
    tag: `low-stock-${productName.toLowerCase().replace(/\s+/g, "-")}`,
    metadata: { product_name: productName, current_stock: currentStock },
  })
}

export async function notifyNewPurchase(customerName: string | null, total: number) {
  const name = customerName || "Cliente"
  await sendNotification({
    type: "new_purchase",
    title: "Nova Compra na Loja!",
    body: `${name} fez uma compra de R$ ${total.toFixed(2)}`,
    url: "/admin/pdv",
    tag: "new-purchase",
    metadata: { customer_name: name, total },
  })
}

export async function notifyOrderStatus(
  orderNumber: number,
  customerName: string,
  newStatus: string
) {
  const statusLabels: Record<string, string> = {
    awaiting_device: "Aguardando Dispositivo",
    in_analysis: "Em Analise",
    awaiting_approval: "Aguardando Aprovacao",
    in_repair: "Em Reparo",
    ready: "Pronto para Retirada",
    delivered: "Entregue",
    cancelled: "Cancelada",
  }

  const label = statusLabels[newStatus] || newStatus

  await sendNotification({
    type: "order_status",
    title: `OS #${orderNumber} - ${label}`,
    body: `Ordem de servico de ${customerName} mudou para: ${label}`,
    url: "/admin/orders",
    tag: `order-${orderNumber}`,
    metadata: { order_number: orderNumber, customer_name: customerName, status: newStatus },
  })
}
