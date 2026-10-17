"use client"

// PROTÓTIPO: barra flutuante para alternar variantes em <basePath>/<variante>. Setas ← → também funcionam.

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"

export type PrototypeVariant = { key: string; name: string }

export function PrototypeSwitcher({ basePath, variants }: { basePath: string; variants: PrototypeVariant[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const current = pathname.split("/").pop()?.toLowerCase()
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key.toLowerCase() === current),
  )

  const go = useCallback(
    (dir: number) => {
      const next = variants[(index + dir + variants.length) % variants.length]
      router.replace(`${basePath}/${next.key.toLowerCase()}`)
      window.scrollTo(0, 0)
    },
    [basePath, index, router, variants],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.closest("input, textarea, select, [contenteditable='true']") || t.isContentEditable)) return
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [go])

  const v = variants[index]
  return (
    <div
      role="toolbar"
      aria-label="Variantes do protótipo"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "max(14px, env(safe-area-inset-bottom, 0px))",
        transform: "translateX(-50%)",
        zIndex: 2147483000,
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: 4,
        borderRadius: 999,
        background: "#fff8c5",
        color: "#111",
        border: "1.5px dashed #111",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,.6)",
        font: "600 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      <SwitchButton label="Variante anterior" onClick={() => go(-1)}>
        ←
      </SwitchButton>
      <span style={{ padding: "0 8px", whiteSpace: "nowrap" }} aria-live="polite">
        PROTÓTIPO · {v.key} ({v.name})
      </span>
      <SwitchButton label="Próxima variante" onClick={() => go(1)}>
        →
      </SwitchButton>
    </div>
  )
}

function SwitchButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 999,
        border: 0,
        background: "#111",
        color: "#fff8c5",
        font: "inherit",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  )
}
