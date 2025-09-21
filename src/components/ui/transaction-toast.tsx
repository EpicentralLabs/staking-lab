import React from 'react'
import { toast } from 'sonner'
import { ExplorerLink } from '@/components/cluster/cluster-ui'
import { TransactionProgress, useTransactionProgress } from './transaction-progress'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

export interface TransactionToastOptions {
  title?: string
  description?: string
  signature?: string
  showProgress?: boolean
  duration?: number
}

export function toastTransaction(
  signature: string,
  options: TransactionToastOptions = {}
) {
  const {
    title = 'Transaction Successful',
    description,
    showProgress = false,
    duration = 5000
  } = options

  return toast(title, {
    description: (
      <div className="space-y-2">
        {description && <p className="text-sm text-gray-300">{description}</p>}
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <ExplorerLink transaction={signature} label="View Transaction" />
          <ExternalLink className="w-3 h-3 opacity-60" />
        </div>
      </div>
    ),
    duration,
    className: 'border-green-500/50 bg-green-900/20',
  })
}

export function toastTransactionError(
  error: string,
  options: { onRetry?: () => void; duration?: number } = {}
) {
  const { onRetry, duration = 8000 } = options

  return toast.error('Transaction Failed', {
    description: (
      <div className="space-y-2">
        <p className="text-sm text-gray-300">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-blue-400 hover:text-blue-300 underline"
          >
            Try again
          </button>
        )}
      </div>
    ),
    duration,
    className: 'border-red-500/50 bg-red-900/20',
  })
}

export function toastTransactionProgress(
  title: string,
  status: 'submitting' | 'confirming' | 'success' | 'error',
  options: { signature?: string; error?: string } = {}
) {
  const { signature, error } = options

  if (status === 'success' && signature) {
    return toastTransaction(signature, { title })
  }

  if (status === 'error' && error) {
    return toastTransactionError(error)
  }

  const isSubmitting = status === 'submitting'
  const isConfirming = status === 'confirming'
  const steps = [
    {
      id: 'submit',
      label: 'Submitting transaction',
      status: isSubmitting
        ? 'active' as const
        : isConfirming
        ? 'completed' as const
        : 'pending' as const
    },
    {
      id: 'confirm',
      label: 'Confirming on blockchain',
      status: isConfirming
        ? 'active' as const
        : 'pending' as const
    },
    {
      id: 'complete',
      label: 'Updating balance',
      status: 'pending' as const
    }
  ]

  return toast(title, {
    description: (
      <TransactionProgress steps={steps} compact className="mt-1" />
    ),
    duration: Infinity, // Keep open until manually dismissed
    className: 'border-blue-500/50 bg-blue-900/20',
  })
}

interface ProgressiveToastState {
  toastId?: string | number
  status: 'idle' | 'submitting' | 'confirming' | 'success' | 'error'
}

export class ProgressiveTransactionToast {
  private state: ProgressiveToastState = { status: 'idle' }
  private title: string

  constructor(title: string) {
    this.title = title
  }

  start() {
    this.state.status = 'submitting'
    this.state.toastId = toastTransactionProgress(this.title, 'submitting')
    return this
  }

  confirming() {
    if (this.state.toastId) {
      toast.dismiss(this.state.toastId)
    }
    this.state.status = 'confirming'
    this.state.toastId = toastTransactionProgress(this.title, 'confirming')
    return this
  }

  success(signature: string, description?: string) {
    if (this.state.toastId) {
      toast.dismiss(this.state.toastId)
    }
    this.state.status = 'success'
    this.state.toastId = toastTransaction(signature, {
      title: this.title,
      description
    })
    return this
  }

  error(error: string, onRetry?: () => void) {
    if (this.state.toastId) {
      toast.dismiss(this.state.toastId)
    }
    this.state.status = 'error'
    this.state.toastId = toastTransactionError(error, { onRetry })
    return this
  }

  dismiss() {
    if (this.state.toastId) {
      toast.dismiss(this.state.toastId)
    }
    this.state = { status: 'idle' }
    return this
  }

  getStatus() {
    return this.state.status
  }
}