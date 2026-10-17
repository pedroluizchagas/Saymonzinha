import type { MetadataRoute } from "next"
import { PWA_THEME_COLOR } from "@/lib/pwa"

// O painel instalado como app (PWA): o ícone é o glifo da marca sobre o vermelho e a abertura fica no
// preto do palco, como o painel.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Painel Saymon Cell",
    short_name: "Saymon Cell",
    description:
      "O painel da Saymon Cell: pedidos de orçamento, ordens de serviço, clientes, vendas e o financeiro da loja.",
    start_url: "/admin",
    scope: "/",
    id: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: PWA_THEME_COLOR,
    theme_color: PWA_THEME_COLOR,
    lang: "pt-BR",
    dir: "ltr",
    categories: ["business", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/pwa/screenshot-narrow.png",
        sizes: "780x1688",
        type: "image/png",
        form_factor: "narrow",
        label: "A entrada do painel no celular",
      },
      {
        src: "/pwa/screenshot-wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "A entrada do painel no computador",
      },
    ],
  }
}
