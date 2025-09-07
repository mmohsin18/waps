'use client'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

// 🔴🟠 Waps Theme Colors
const wapsColors = {
  primary: 'bg-[#FF4D2E] hover:bg-[#E63E20] text-white',
  outline:
    'border border-[#FF4D2E] text-[#FF4D2E] hover:bg-[#FF4D2E]/10 hover:text-[#E63E20]',
  glow: 'bg-[#FF4D2E] text-white shadow-[0_0_20px_2px_rgba(255,77,46,0.6)] hover:shadow-[0_0_25px_3px_rgba(255,122,69,0.7)] hover:bg-[#E63E20]'
}

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: wapsColors.primary,
        outline: wapsColors.outline,
        glow: wapsColors.glow
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md'
    }
  }
)

export interface WapsButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const WapsButton = React.forwardRef<HTMLButtonElement, WapsButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

WapsButton.displayName = 'WapsButton'

export { WapsButton, buttonVariants }
