import { Geist, Geist_Mono, Sofia_Sans_Extra_Condensed } from "next/font/google"

// PROTÓTIPO: as três vozes tipográficas do redesign (mesmas do Foldfolio).
// As variáveis --sc-font-* são lidas por sc-system.css dentro de .sc.

const display = Sofia_Sans_Extra_Condensed({
  subsets: ["latin"],
  weight: ["800", "900"],
  variable: "--sc-font-display",
  display: "swap",
})

const text = Geist({
  subsets: ["latin"],
  variable: "--sc-font-text",
  display: "swap",
})

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--sc-font-mono",
  display: "swap",
})

export const scFontVariables = `${display.variable} ${text.variable} ${mono.variable}`
