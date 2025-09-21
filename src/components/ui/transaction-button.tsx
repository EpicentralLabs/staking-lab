import React from 'react'
import { Button, buttonVariants } from './button'
import { Spinner } from './spinner'
import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

export type TransactionState = 'idle' | 'submitting' | 'confirming' | 'success' | 'error'

const transactionButtonVariants = cva('', {
  variants: {
    transactionState: {
      idle: '',
      submitting: 'opacity-90 cursor-wait',
      confirming: 'opacity-90 cursor-wait',
      success: 'bg-green-600 hover:bg-green-600 border-green-500',
      error: 'bg-red-600 hover:bg-red-600 border-red-500',
    },
  },
  defaultVariants: {
    transactionState: 'idle',
  },
})

interface TransactionButtonProps
  extends Omit<React.ComponentProps<typeof Button>, 'disabled'>,
    VariantProps<typeof transactionButtonVariants> {
  transactionState: TransactionState
  idleText: string
  submittingText?: string
  confirmingText?: string
  successText?: string
  errorText?: string
  onRetry?: () => void
  disabled?: boolean
}

export function TransactionButton({
  transactionState,
  idleText,
  submittingText = 'Submitting...',
  confirmingText = 'Confirming...',
  successText = 'Success!',
  errorText = 'Failed - Retry',
  onRetry,
  disabled = false,
  className,
  children,
  onClick,
  ...props
}: TransactionButtonProps) {
  const isDisabled = disabled || ['submitting', 'confirming'].includes(transactionState)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (transactionState === 'error' && onRetry) {
      onRetry()
    } else if (onClick && transactionState === 'idle') {
      onClick(e)
    }
  }

  const getButtonContent = () => {
    switch (transactionState) {
      case 'submitting':
        return (
          <>
            <Spinner size="small" className="text-current" />
            {submittingText}
          </>
        )
      case 'confirming':
        return (
          <>
            <Spinner size="small" className="text-current" />
            {confirmingText}
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4" />
            {successText}
          </>
        )
      case 'error':
        return (
          <>
            <XCircle className="w-4 h-4" />
            {errorText}
          </>
        )
      default:
        return children || idleText
    }
  }

  return (
    <Button
      disabled={isDisabled}
      className={cn(
        transactionButtonVariants({ transactionState }),
        'transition-all duration-300 ease-in-out',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {getButtonContent()}
    </Button>
  )
}

export type { VariantProps as TransactionButtonVariantProps }