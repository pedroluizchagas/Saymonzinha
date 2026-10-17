import type { MetadataRoute } from "next"
import { SITE_URL } from "@/components/home/shared/content"

// Fora do Google: o painel, o login e os endereços que só serviram para aprovação.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth", "/nova-home", "/nova-loja", "/prototipo"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
