"use client"

// Moldura das telas de entrada do painel (login, cadastro e confirmação): a tela de bloqueio da
// Desdobra. Entrar no painel é desbloquear o celular: o relógio de Divinópolis no topo e o formulário
// num cartão de vidro. No computador, tudo dentro do aparelho, no palco com o halo vermelho; no
// celular, a própria tela é a tela de bloqueio.

import type { ReactNode } from "react"
import Link from "next/link"
import { useClock } from "@/components/home/shared/device-ui"

export function AuthScreen({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  const time = useClock()
  return (
    <div className="relative isolate grid min-h-screen-safe place-items-center overflow-hidden px-4 py-8 lg:py-12">
      {/* o halo e o tapete de corte da bancada */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(48%_42%_at_50%_42%,rgba(255,2,0,0.3),transparent_72%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(var(--color-sc-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-sc-line)_1px,transparent_1px)] bg-[size:56px_56px] bg-center opacity-50 [mask-image:radial-gradient(55%_60%_at_50%_45%,#000_15%,transparent_80%)]"
      />

      {/* o aparelho, só no computador: aro, borda e tela */}
      <div className="w-full max-w-[400px] lg:rounded-[46px] lg:bg-[linear-gradient(160deg,#5d5753_0%,#2e2b28_18%,#1f1d1b_50%,#2e2b28_80%,#4b4643_100%)] lg:p-1 lg:shadow-[0_50px_90px_-40px_rgba(0,0,0,0.75),0_30px_60px_-30px_rgba(0,0,0,0.5)]">
        <div className="lg:rounded-[42px] lg:bg-[#050505] lg:p-[9px]">
          <div className="relative lg:min-h-[720px] lg:overflow-hidden lg:rounded-[34px] lg:bg-[radial-gradient(120%_55%_at_50%_112%,rgba(255,2,0,0.42),transparent_62%),#060606] lg:px-5 lg:pt-14 lg:pb-6">
            {/* barra de status do aparelho */}
            <div className="absolute inset-x-0 top-0 hidden h-11 items-center justify-between px-7 pt-2.5 text-[15px] font-semibold tabular-nums lg:flex" aria-hidden="true">
              <span>{time}</span>
              <span className="flex items-center gap-1.5 text-xs">
                5G
                <span className="relative h-3 w-6 rounded-[4px] border-[1.5px] border-current p-[1.5px]">
                  <span className="block h-full w-[72%] rounded-[1.5px] bg-current" />
                </span>
              </span>
            </div>

            <div className="text-center">
              <Link href="/" className="sc-logo" aria-label="Saymon Cell, ir para o site">
                Saymon <b>Cell</b>
                <sup>®</sup>
              </Link>
              <p className="mt-6 font-display text-[clamp(84px,24vw,104px)] leading-[0.9] font-extrabold tracking-[-0.01em] tabular-nums text-sc-bone" aria-hidden="true">
                {time}
              </p>
              <p className="mt-2 text-[13px] font-medium text-sc-stone">Painel · Divinópolis, MG</p>
            </div>

            {/* o cartão de vidro escuro com o formulário */}
            <div className="mt-8 rounded-[24px] border border-white/[0.08] bg-[rgba(20,18,16,0.78)] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[20px]">
              <h1 className="font-display text-[34px] leading-[0.9] font-black uppercase tracking-[-0.01em] text-sc-bone">{title}</h1>
              {note && <p className="mt-2 text-sm text-sc-stone">{note}</p>}
              <div className="mt-5">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
