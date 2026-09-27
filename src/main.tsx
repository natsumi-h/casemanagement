import '@mantine/core/styles.css'
import './index.css'
import { MantineProvider } from '@mantine/core'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

// WebViewer は StrictMode の二重マウントで二重初期化されるため StrictMode は使用しない
createRoot(document.getElementById('root')!).render(
  <MantineProvider>
    <App />
  </MantineProvider>,
)
