import { useEffect, useMemo, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isSSR() {
  return typeof window === 'undefined' || typeof navigator === 'undefined'
}

function getUAFlags() {
  if (isSSR())
    return {
      isIOS: false,
      isChromium: false,
      isStandalone: false,
      isSafari: false
    }
  const ua = navigator.userAgent || ''
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isChromium =
    // Chrome, Edge, Brave etc
    (!!(window as any).chrome && !!(window as any).chrome.webstore) ||
    /Chrom(e|ium)/.test(ua)
  // iOS Safari standalone (PWA) flag
  const isStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    (navigator as any).standalone === true
  // Desktop Safari detection: WebKit but not Chrome
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return { isIOS, isChromium, isStandalone, isSafari }
}

export function usePwaInstall() {
  const [{ isIOS, isChromium, isStandalone, isSafari }, setFlags] =
    useState(getUAFlags)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  )
  const [installed, setInstalled] = useState<boolean>(isStandalone)

  useEffect(() => {
    if (isSSR()) return

    // Refresh flags once on mount
    setFlags(getUAFlags())

    // Listen for Chromium event
    const onBIP = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBIP as EventListener)

    // Track install event
    const onInstalled = () => setInstalled(true)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBIP as EventListener)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  // Can we show a *programmatic* prompt?
  const canPromptChromium = !!deferred

  // Can we reasonably offer "Install" UX (even if it’s instructions)?
  const canInstall = useMemo(() => {
    if (installed) return false
    if (canPromptChromium) return true // programmatic
    if (isIOS && !installed) return true // show iOS instructions
    if (isSafari && !installed) return true // show Safari instructions
    return false
  }, [installed, canPromptChromium, isIOS, isSafari])

  // Platform-specific instruction text
  function instructionText() {
    if (isSSR()) return ''
    if (isIOS) {
      return "To install:\n1) Tap the Share button in Safari\n2) Choose 'Add to Home Screen'"
    }
    if (isSafari) {
      return "To install on Safari:\n1) Open the browser's menu\n2) Choose 'Add to Dock' or 'Add to Home Screen' (on macOS/iOS)"
    }
    return "Your browser doesn't support programmatic PWA install. Try Chrome/Edge or use your browser's 'Install App' / 'Create shortcut' option."
  }

  async function install() {
    if (installed) return

    if (deferred) {
      try {
        await deferred.prompt()
        const { outcome } = await deferred.userChoice
        // If dismissed, you might want to keep the event for later; spec allows one-time use
        setDeferred(null)
        // outcome: 'accepted' | 'dismissed'
        return outcome
      } catch (err) {
        setDeferred(null)
        throw err
      }
    }

    // No programmatic prompt available → show instructions
    alert(instructionText())
    return 'instructions'
  }

  return {
    canInstall,
    canPromptChromium, // true only when programmatic prompt is available
    installed, // whether already installed
    install, // call this onClick
    isIOS,
    isSafari,
    isChromium,
    instructionText
  }
}
