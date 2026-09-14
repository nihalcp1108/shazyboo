import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'

if (typeof document !== 'undefined') {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  )
}

export async function prerender(data) {
  const { renderToString } = await import('react-dom/server')
  const html = renderToString(
    <StrictMode>
      <HelmetProvider>
        <App url={data.url} />
      </HelmetProvider>
    </StrictMode>
  )
  return { html }
}
