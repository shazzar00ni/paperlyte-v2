import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Self-hosted Google Fonts (Inter) for better security and performance
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
// Self-hosted Font Awesome for better security and performance
import '@fortawesome/fontawesome-free/css/all.min.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
