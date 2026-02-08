import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Saymon Cell Admin",
    short_name: "Admin",
    description:
      "Painel administrativo do Saymon Cell com acesso rápido às ordens de serviço, clientes e finanças.",
    start_url: "/admin",
    scope: "/admin",
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#ff0200",
    lang: "pt-BR",
    icons: [
      {
        src: "/images/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
