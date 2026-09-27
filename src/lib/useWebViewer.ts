import WebViewer, { type WebViewerInstance, type WebViewerOptions } from '@pdftron/webviewer'
import { useEffect, useRef, useState } from 'react'

const licenseKey = import.meta.env.VITE_APRYSE_LICENSE_KEY as string | undefined

/**
 * コンテナ要素に WebViewer を 1 度だけ初期化し、UI を日本語に設定する。
 * コンポーネントの unmount 時には UI を破棄する。
 */
export function useWebViewer(options: Partial<WebViewerOptions> = {}) {
  const viewerRef = useRef<HTMLDivElement>(null)
  const [instance, setInstance] = useState<WebViewerInstance | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    const element = viewerRef.current
    if (!element) return
    let disposed = false
    let created: WebViewerInstance | null = null

    WebViewer(
      {
        path: '/lib/webviewer',
        licenseKey: licenseKey || undefined,
        ...optionsRef.current,
      },
      element,
    ).then(async (inst) => {
      created = inst
      if (disposed) {
        inst.UI.dispose()
        return
      }
      await inst.UI.setLanguage('ja')
      setInstance(inst)
    })

    return () => {
      disposed = true
      created?.UI.dispose()
      element.innerHTML = ''
    }
  }, [])

  return { viewerRef, instance }
}
