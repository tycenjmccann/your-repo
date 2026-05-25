import { useToast } from '../components/ui/ToastProvider'
import './Dashboard.css'

const Dashboard = () => {
  const { addToast } = useToast()

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <h1 className="dashboard__title">Toast Notification Demo</h1>
        <p className="dashboard__description">
          Click any button below to trigger a toast notification. Toasts appear
          in the bottom-right corner and auto-dismiss after 5 seconds.
        </p>

        <div className="dashboard__buttons">
          <button
            className="dashboard__btn dashboard__btn--success"
            onClick={() =>
              addToast({
                message: 'Your changes have been saved successfully.',
                variant: 'success',
              })
            }
          >
            Show Success Toast
          </button>

          <button
            className="dashboard__btn dashboard__btn--error"
            onClick={() =>
              addToast({
                message: 'Something went wrong. Please try again.',
                variant: 'error',
              })
            }
          >
            Show Error Toast
          </button>

          <button
            className="dashboard__btn dashboard__btn--warning"
            onClick={() =>
              addToast({
                message: 'Your session will expire in 5 minutes.',
                variant: 'warning',
              })
            }
          >
            Show Warning Toast
          </button>

          <button
            className="dashboard__btn dashboard__btn--info"
            onClick={() =>
              addToast({
                message: 'A new version is available for download.',
                variant: 'info',
              })
            }
          >
            Show Info Toast
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
