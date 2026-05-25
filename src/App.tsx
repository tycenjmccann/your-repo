import { ToastProvider } from './components/ui/ToastProvider'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  )
}

export default App
