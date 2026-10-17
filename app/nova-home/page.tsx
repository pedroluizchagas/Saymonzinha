import type { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { HomeNova } from "@/components/home/home-nova"
import { getFeaturedProducts } from "@/lib/actions/store-actions"
import { PRESENTATION_COOKIE, choosePresentation } from "@/lib/home-presentation"

// Home nova em aprovação: fica fora do Google até substituir a home atual.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function NovaHomePage() {
  const [requestHeaders, cookieStore] = await Promise.all([headers(), cookies()])
  const { version } = choosePresentation({
    userAgent: requestHeaders.get("user-agent") ?? undefined,
    mobileHint: requestHeaders.get("sec-ch-ua-mobile"),
    cookie: cookieStore.get(PRESENTATION_COOKIE)?.value,
  })
  const products = await getFeaturedProducts(4).catch(() => [])

  return <HomeNova version={version} products={products} />
}
