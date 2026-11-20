import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/react'
import './App.css'
import './index.css'
import App from './App.jsx'
import ClerkSession from './components/ClerkSession.jsx'

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {publishableKey ? (
      <ClerkProvider publishableKey={publishableKey}>
        <ClerkSession />
      </ClerkProvider>
    ) : <App />}
  </StrictMode>,
)
