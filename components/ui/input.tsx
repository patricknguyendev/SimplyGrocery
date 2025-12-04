import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'glass h-11 w-full min-w-0 rounded-xl px-4 py-3 text-base text-foreground shadow-lg transition-spring outline-none',
        'placeholder:text-muted-foreground',
        'selection:bg-primary selection:text-primary-foreground',
        'focus-visible:border-glow-green focus-visible:glow-green focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:border-glow-pink aria-invalid:glow-pink aria-invalid:ring-destructive/50 aria-invalid:ring-[3px]',
        'file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'md:text-sm',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
