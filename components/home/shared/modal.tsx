"use client"

// Janela do site (a do pedido de orçamento e a do carrinho): o <dialog> nativo, que prende o foco e
// fecha com Esc. Fecha também ao tocar fora e devolve o foco a quem abriu.

import { useEffect, useRef, type ReactNode } from "react"
import "../sc-system.css"
import "./modal.css"

/** Folha que sobe de baixo (toque ou tela estreita), centralizada ou ao lado (computador). */
export type ModalLayout = "sheet" | "center" | "side"

export function Modal({
  open,
  onClose,
  layout,
  labelledBy,
  className,
  children,
}: {
  open: boolean
  onClose: () => void
  layout: ModalLayout
  labelledBy: string
  className?: string
  children: ReactNode
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      dialog.showModal()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={className ? `sc sc-modal ${className}` : "sc sc-modal"}
      data-layout={layout}
      aria-labelledby={labelledBy}
      onClose={() => {
        onClose()
        openerRef.current?.focus()
      }}
      onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
    >
      {children}
    </dialog>
  )
}
