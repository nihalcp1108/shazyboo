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
  const helmetContext = {}

  const html = renderToString(
    <StrictMode>
      <HelmetProvider context={helmetContext}>
        <App url={data.url} />
      </HelmetProvider>
    </StrictMode>
  )

  const { helmet } = helmetContext

  const titleEl = helmet.title.toComponent()[0]
  const title = titleEl?.props?.children ?? undefined

  const toElementDescriptor = (el) => {
    const props = {}
    for (const [key, value] of Object.entries(el.props || {})) {
      if (value !== undefined && value !== null) {
        props[key] = String(value)
      }
    }
    return { type: el.type, props }
  }

  const elements = new Set([
    ...helmet.meta.toComponent(),
    ...helmet.link.toComponent(),
  ].map(toElementDescriptor))

  return {
    html,
    head: {
      lang: 'en',
      title,
      elements,
    },
  }
}
