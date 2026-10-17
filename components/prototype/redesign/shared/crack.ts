// PROTÓTIPO: gera o vidro trincado de forma determinística (mesma saída no SSR e no cliente).
// Cada caminho começa no ponto de impacto, então "curar" = recolher o traço até o centro.

type Point = [number, number]

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const fmt = (n: number) => Math.round(n * 10) / 10
const toPath = (pts: Point[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${fmt(x)} ${fmt(y)}`).join("")

function pointAt(pts: Point[], dist: number): Point | null {
  let acc = 0
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1]
    const [x1, y1] = pts[i]
    const seg = Math.hypot(x1 - x0, y1 - y0)
    if (acc + seg >= dist) {
      const t = (dist - acc) / seg
      return [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]
    }
    acc += seg
  }
  return null
}

export type Crack = { d: string; w: number; delay: number }

export function makeCracks(seed: number, width: number, height: number, cx: number, cy: number): Crack[] {
  const rnd = mulberry32(seed)
  const reach = Math.hypot(Math.max(cx, width - cx), Math.max(cy, height - cy))
  const rays: Point[][] = []
  const out: Crack[] = []
  const count = 14

  for (let i = 0; i < count; i++) {
    let a = (i / count) * Math.PI * 2 + (rnd() - 0.5) * 0.4
    let x = cx
    let y = cy
    const pts: Point[] = [[x, y]]
    const len = reach * (0.45 + rnd() * 0.7)
    for (let d = 0; d < len; ) {
      const step = 14 + rnd() * 30
      a += (rnd() - 0.5) * 0.3
      x += Math.cos(a) * step
      y += Math.sin(a) * step
      d += step
      pts.push([x, y])
      if (x < -30 || x > width + 30 || y < -30 || y > height + 30) break
    }
    rays.push(pts)
    out.push({ d: toPath(pts), w: 1.1 + rnd() * 0.8, delay: rnd() * 0.3 })

    // galhos que saem do raio principal
    if (pts.length > 4 && rnd() < 0.7) {
      const k = 2 + Math.floor(rnd() * (pts.length - 3))
      let [bx, by] = pts[k]
      let ba = a + (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.5)
      const branch: Point[] = [[bx, by]]
      for (let j = 0; j < 3 + rnd() * 5; j++) {
        ba += (rnd() - 0.5) * 0.4
        const step = 12 + rnd() * 22
        bx += Math.cos(ba) * step
        by += Math.sin(ba) * step
        branch.push([bx, by])
      }
      out.push({ d: toPath(branch), w: 0.8 + rnd() * 0.5, delay: 0.2 + rnd() * 0.3 })
    }
  }

  // anéis concêntricos irregulares ligando raios vizinhos
  for (const radius of [16, 44, 92, 160]) {
    for (let i = 0; i < count; i++) {
      if (rnd() > 0.78) continue
      const p = pointAt(rays[i], radius * (0.85 + rnd() * 0.3))
      const q = pointAt(rays[(i + 1) % count], radius * (0.85 + rnd() * 0.3))
      if (!p || !q) continue
      const mid: Point = [
        (p[0] + q[0]) / 2 + (rnd() - 0.5) * radius * 0.18,
        (p[1] + q[1]) / 2 + (rnd() - 0.5) * radius * 0.18,
      ]
      out.push({ d: toPath([p, mid, q]), w: 0.7 + rnd() * 0.5, delay: 0.1 + rnd() * 0.4 })
    }
  }
  return out
}
