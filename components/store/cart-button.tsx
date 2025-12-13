"use client"

import { useCart } from "@/contexts/cart-context"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

export function CartButton() {
  const { setIsOpen, getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <Button variant="outline" size="icon" className="relative bg-transparent" onClick={() => setIsOpen(true)}>
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  )
}
