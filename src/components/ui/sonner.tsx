'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-right"
      closeButton
      richColors
      style={
        {
          '--normal-bg': 'rgba(17, 24, 39, 0.9)',
          '--normal-border': 'rgba(55, 65, 81, 0.4)',
          '--normal-text': 'rgb(255, 255, 255)',
          '--success-bg': 'rgba(17, 24, 39, 0.9)',
          '--success-border': 'rgba(74, 133, 255, 0.4)',
          '--success-text': 'rgb(255, 255, 255)',
          '--error-bg': 'rgba(17, 24, 39, 0.9)',
          '--error-border': 'rgba(239, 68, 68, 0.4)',
          '--error-text': 'rgb(255, 255, 255)',
          '--info-bg': 'rgba(17, 24, 39, 0.9)',
          '--info-border': 'rgba(74, 133, 255, 0.4)',
          '--info-text': 'rgb(255, 255, 255)',
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
