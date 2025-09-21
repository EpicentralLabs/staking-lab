import React from 'react'
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ProgressStep = {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed' | 'error'
}

interface TransactionProgressProps {
  steps: ProgressStep[]
  className?: string
  compact?: boolean
}

export function TransactionProgress({ steps, className, compact = false }: TransactionProgressProps) {
  if (compact) {
    return <CompactProgress steps={steps} className={className} />
  }

  return (
    <div className={cn('space-y-3', className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center space-x-3">
          <StepIcon status={step.status} />
          <div className="flex-1">
            <div
              className={cn(
                'text-sm transition-colors duration-200',
                step.status === 'completed'
                  ? 'text-green-400'
                  : step.status === 'active'
                  ? 'text-white font-medium'
                  : step.status === 'error'
                  ? 'text-red-400'
                  : 'text-gray-400'
              )}
            >
              {step.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CompactProgress({ steps, className }: { steps: ProgressStep[]; className?: string }) {
  const activeStep = steps.find(step => step.status === 'active')
  const errorStep = steps.find(step => step.status === 'error')
  const completedCount = steps.filter(step => step.status === 'completed').length

  if (errorStep) {
    return (
      <div className={cn('flex items-center space-x-2 text-red-400', className)}>
        <XCircle className="w-4 h-4" />
        <span className="text-sm">{errorStep.label}</span>
      </div>
    )
  }

  if (activeStep) {
    return (
      <div className={cn('flex items-center space-x-2 text-white', className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">{activeStep.label}</span>
      </div>
    )
  }

  if (completedCount === steps.length) {
    return (
      <div className={cn('flex items-center space-x-2 text-green-400', className)}>
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Transaction Complete</span>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center space-x-2 text-gray-400', className)}>
      <Clock className="w-4 h-4" />
      <span className="text-sm">Waiting...</span>
    </div>
  )
}

function StepIcon({ status }: { status: ProgressStep['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-5 h-5 text-green-400" />
    case 'active':
      return <Loader2 className="w-5 h-5 text-white animate-spin" />
    case 'error':
      return <XCircle className="w-5 h-5 text-red-400" />
    default:
      return (
        <div className="w-5 h-5 rounded-full border-2 border-gray-600 bg-gray-800">
          <div className="w-full h-full rounded-full bg-gray-600" />
        </div>
      )
  }
}

export function useTransactionProgress(isSubmitting: boolean, isConfirming: boolean, isSuccess: boolean, isError: boolean) {
  const steps: ProgressStep[] = [
    {
      id: 'submit',
      label: 'Submitting transaction',
      status: isSubmitting
        ? 'active'
        : isConfirming || isSuccess
        ? 'completed'
        : isError
        ? 'error'
        : 'pending'
    },
    {
      id: 'confirm',
      label: 'Confirming on blockchain',
      status: isConfirming
        ? 'active'
        : isSuccess
        ? 'completed'
        : isError && !isSubmitting
        ? 'error'
        : 'pending'
    },
    {
      id: 'complete',
      label: 'Updating balance',
      status: isSuccess ? 'completed' : 'pending'
    }
  ]

  return steps
}