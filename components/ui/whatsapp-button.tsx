"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/5537999220892?text=Olá%20Saymon%20Cell%2C%20vi%20o%20site%20e%20gostaria%20de%20um%20orçamento%20para..."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-[#25D366] via-[#20BA5C] to-[#128C7E] hover:opacity-90 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Chamar no WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
    </a>
  )
}
