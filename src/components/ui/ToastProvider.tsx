import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
} from 'react'
import { createPortal } from 'react-dom'
import { Toast, ToastVariant } from './Toast'
import './Toast.css'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastContextValue {
  addToast: (options: {
    message: string
    variant: ToastVariant
    duration?: number
  }) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback(
    (options: {
      message: string
      variant: ToastVariant
      duration?: number
    }) => {
      const id = crypto.randomUUID()
      const duration = options.duration ?? 5000

      const newToast: ToastItem = {
        id,
        message: options.message,
        variant: options.variant,
        duration,
      }

      setToasts((prev) => [...prev, newToast])

      const timer = setTimeout(() => {
        removeToast(id)
      }, duration + 350)

      timersRef.current.set(id, timer)
    },
    [removeToast]
  )

  const toastContainer = (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          variant={toast.variant}
          duration={toast.duration}
          onDismiss={removeToast}
        />
      ))}
    </div>
  )

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {createPortal(toastContainer, document.body)}
    </ToastContext.Provider>
  )
}
