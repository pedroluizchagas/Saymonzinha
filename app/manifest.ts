import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saymon Cell Admin",
    short_name: "Saymon Cell",
    description:
      "Painel administrativo do Saymon Cell com acesso rapido as ordens de servico, clientes e financas.",
    start_url: "/admin",
    scope: "/",
    id: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#ff0200",
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
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "narrow",
        label: "Painel administrativo Saymon Cell - Mobile",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
        form_factor: "wide",
        label: "Painel administrativo Saymon Cell - Desktop",
      },
    ],
  }
}
