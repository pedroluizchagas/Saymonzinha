import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'border-sc-line bg-sc-raised placeholder:text-sc-smoke focus-visible:border-sc-red aria-invalid:border-sc-red flex field-sizing-content min-h-20 w-full rounded-[10px] border px-3.5 py-2.5 text-base transition-[color,border-color] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
