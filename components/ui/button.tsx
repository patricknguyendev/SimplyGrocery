import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-spring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] float-on-hover",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 glow-green-hover breathing-glow shadow-lg',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 glow-pink-hover shadow-lg',
        outline:
          'glass border-glow-green-hover shadow-lg hover:glow-green',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/90 glow-purple-hover shadow-lg',
        ghost:
          'hover:glass hover:glow-green',
        link: 'text-primary underline-offset-4 hover:underline text-glow-green',
        glass: 'glass glow-green-hover border-glow-green shadow-xl',
        neon: 'bg-emerald-500 text-slate-950 font-bold shadow-2xl hover:bg-emerald-400 hover:shadow-[0_0_40px_rgba(107,255,184,0.6)] hover:scale-105 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D0F] transition-all duration-300',
      },
      size: {
        default: 'h-11 px-6 py-3 has-[>svg]:px-5',
        sm: 'h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-14 rounded-xl px-8 text-base has-[>svg]:px-6',
        icon: 'size-11 rounded-xl',
        'icon-sm': 'size-9 rounded-lg',
        'icon-lg': 'size-14 rounded-xl',
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
