import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-sc-smoke selection:bg-sc-red-strong selection:text-white border-sc-line bg-sc-raised h-11 w-full min-w-0 rounded-[10px] border px-3.5 py-1 text-base transition-[color,border-color,box-shadow] outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-sc-red',
        'aria-invalid:border-sc-red',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
