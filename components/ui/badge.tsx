import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full border px-2 py-[3px] font-mono text-[10.5px] leading-[1.2] font-medium uppercase tracking-[0.06em] w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:outline-2 focus-visible:outline-sc-red transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-sc-red-strong text-white [a&]:hover:brightness-110',
        secondary:
          'border-transparent bg-white/[0.08] text-sc-bone [a&]:hover:bg-white/[0.12]',
        destructive:
          'border-transparent bg-sc-red-deep text-white [a&]:hover:brightness-110',
        outline:
          'border-sc-line text-sc-stone [a&]:hover:bg-sc-raised [a&]:hover:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
