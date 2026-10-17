'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'peer data-[state=checked]:bg-sc-red-strong data-[state=unchecked]:bg-sc-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sc-red inline-flex h-6 w-10 shrink-0 items-center rounded-full border border-transparent transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          'bg-sc-bone pointer-events-none block size-5 rounded-full ring-0 shadow-[0_1px_3px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=checked]:translate-x-[17px] data-[state=unchecked]:translate-x-[1px]'
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
