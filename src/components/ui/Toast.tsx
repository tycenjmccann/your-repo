import React, { useEffect, useState } from 'react'
import './Toast.css'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
  onDismiss: (id: string) => void
}

const variantIcons: Record<ToastVariant, string> = {
  success: '\u2713',
  error: '\u2715',
  warning: '\u26A0',
  info: '\u2139',
}

const variantLabels: Record<ToastVariant, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Info',
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant,
  duration = 5000,
  onDismiss,
}) => {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss(id)
    }, 300)
  }

  return (
    <div
      className={`toast toast--${variant} ${isExiting ? 'toast--exiting' : ''}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast__icon" aria-hidden="true">
        {variantIcons[variant]}
      </div>
      <div className="toast__content">
        <span className="toast__label">{variantLabels[variant]}</span>
        <p className="toast__message">{message}</p>
      </div>
      <button
        className="toast__dismiss"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        type="button"
      >
        \u2715
      </button>
      <div
        className="toast__progress"
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  )
}
