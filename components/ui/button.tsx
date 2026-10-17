import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// Botões do painel no sistema visual da home: pílulas (sc-pill), o vermelho forte com rótulo branco
// para a ação principal e o vidro escuro para as secundárias.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[13px] leading-[1.3] font-medium transition-[transform,background-color,color,filter,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sc-red aria-invalid:outline-2 aria-invalid:outline-sc-red",
  {
    variants: {
      variant: {
        default: 'bg-sc-red-strong text-white hover:brightness-110',
        destructive: 'bg-sc-red-deep text-white hover:brightness-110',
        outline: 'border border-sc-line bg-transparent text-foreground hover:bg-sc-raised',
        secondary: 'bg-white/[0.08] text-foreground hover:bg-white/[0.12]',
        ghost: 'text-sc-stone hover:bg-sc-raised hover:text-foreground',
        link: 'rounded-none text-sc-red underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 has-[>svg]:px-4',
        sm: 'h-8 gap-1.5 px-3.5 has-[>svg]:px-3',
        lg: 'h-12 px-6 text-sm has-[>svg]:px-5',
        icon: 'size-10',
        'icon-sm': 'size-8',
        'icon-lg': 'size-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
