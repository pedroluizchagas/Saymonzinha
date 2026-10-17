import { cookies, headers } from "next/headers"
import { HomeNova } from "@/components/home/home-nova"
import { getFeaturedProducts } from "@/lib/actions/store-actions"
import { PRESENTATION_COOKIE, choosePresentation } from "@/lib/home-presentation"

// A home: a Desdobra no desktop e a Raio-X em celular e tablet (ver docs/adr/0001). O título e a
// descrição vêm do layout.
export default async function HomePage() {
  const [requestHeaders, cookieStore] = await Promise.all([headers(), cookies()])
  const presentation = choosePresentation({
    userAgent: requestHeaders.get("user-agent") ?? undefined,
    mobileHint: requestHeaders.get("sec-ch-ua-mobile"),
    cookie: cookieStore.get(PRESENTATION_COOKIE)?.value,
  })
  const products = await getFeaturedProducts(4).catch(() => [])

  return <HomeNova presentation={presentation} products={products} />
}
