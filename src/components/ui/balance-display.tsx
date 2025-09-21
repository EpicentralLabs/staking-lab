import React, { useEffect, useState } from 'react'
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BalanceDisplayProps {
  label: string
  value: number
  symbol: string
  isLoading?: boolean
  error?: string | null
  className?: string
  variant?: 'default' | 'large' | 'compact'
  showTrend?: boolean
  previousValue?: number
  precision?: number
  onClick?: () => void
  clickable?: boolean
  clickHint?: string
}

export function BalanceDisplay({
  label,
  value,
  symbol,
  isLoading = false,
  error = null,
  className,
  variant = 'default',
  showTrend = false,
  previousValue,
  precision = 2,
  onClick,
  clickable = false,
  clickHint,
}: BalanceDisplayProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (value !== displayValue && !isLoading) {
      setIsAnimating(true)

      const duration = 800 // Animation duration in ms
      const steps = 30
      const stepDuration = duration / steps
      const difference = value - displayValue
      const stepValue = difference / steps

      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        setDisplayValue(prev => {
          const newValue = displayValue + (stepValue * currentStep)
          return currentStep >= steps ? value : newValue
        })

        if (currentStep >= steps) {
          clearInterval(interval)
          setIsAnimating(false)
          setDisplayValue(value)
        }
      }, stepDuration)

      return () => clearInterval(interval)
    }
  }, [value, displayValue, isLoading])

  const formatValue = (val: number) => {
    return val.toLocaleString(undefined, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    })
  }

  const getTrendIcon = () => {
    if (!showTrend || previousValue === undefined) return null

    if (value > previousValue) {
      return <TrendingUp className="w-3 h-3 text-green-400" />
    } else if (value < previousValue) {
      return <TrendingDown className="w-3 h-3 text-red-400" />
    } else {
      return <Minus className="w-3 h-3 text-gray-400" />
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'large':
        return {
          container: 'space-y-2',
          label: 'text-sm sm:text-base text-gray-400',
          value: 'text-2xl sm:text-3xl font-bold font-mono',
          symbol: 'text-base sm:text-lg font-medium ml-2'
        }
      case 'compact':
        return {
          container: 'space-y-1',
          label: 'text-xs text-gray-400',
          value: 'text-sm font-semibold font-mono',
          symbol: 'text-xs font-medium ml-1'
        }
      default:
        return {
          container: 'space-y-2',
          label: 'text-xs sm:text-sm text-gray-400',
          value: 'text-base sm:text-lg font-semibold font-mono',
          symbol: 'text-sm font-medium ml-1'
        }
    }
  }

  const styles = getVariantStyles()

  if (error) {
    return (
      <div className={cn(styles.container, className)}>
        <div className={styles.label}>{label}:</div>
        <div className="text-red-400 text-sm">Error loading balance</div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        styles.container,
        clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={clickable ? onClick : undefined}
      title={clickable ? clickHint : undefined}
    >
      <div className={cn(styles.label, 'flex items-center space-x-1')}>
        <span>{label}:</span>
        {getTrendIcon()}
      </div>

      <div className="flex items-baseline">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        ) : (
          <>
            <span
              className={cn(
                styles.value,
                'text-white transition-all duration-300',
                isAnimating && 'scale-105 text-blue-400'
              )}
            >
              {formatValue(displayValue)}
            </span>
            <span className={cn(styles.symbol, 'text-gray-300')}>
              {symbol}
            </span>
          </>
        )}
      </div>
    </div>
  )
}

interface AnimatedBalanceChangeProps {
  previousValue: number
  currentValue: number
  symbol: string
  className?: string
}

export function AnimatedBalanceChange({
  previousValue,
  currentValue,
  symbol,
  className
}: AnimatedBalanceChangeProps) {
  const difference = currentValue - previousValue
  const isIncrease = difference > 0

  if (difference === 0) return null

  return (
    <div className={cn(
      'inline-flex items-center space-x-1 text-sm font-medium',
      isIncrease ? 'text-green-400' : 'text-red-400',
      className
    )}>
      {isIncrease ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      <span>
        {isIncrease ? '+' : ''}{difference.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} {symbol}
      </span>
    </div>
  )
}

export function SkeletonBalanceDisplay({ variant = 'default' }: { variant?: 'default' | 'large' | 'compact' }) {
  const getSkeletonStyles = () => {
    switch (variant) {
      case 'large':
        return {
          label: 'h-4 w-24',
          value: 'h-8 w-32'
        }
      case 'compact':
        return {
          label: 'h-3 w-16',
          value: 'h-4 w-20'
        }
      default:
        return {
          label: 'h-3 w-20',
          value: 'h-5 w-24'
        }
    }
  }

  const styles = getSkeletonStyles()

  return (
    <div className="space-y-2 animate-pulse">
      <div className={cn('bg-gray-700 rounded', styles.label)} />
      <div className={cn('bg-gray-600 rounded', styles.value)} />
    </div>
  )
}