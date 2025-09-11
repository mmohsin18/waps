import { useEffect, useState } from 'react'

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const installPwa = async () => {
    if (!deferredPrompt) {
      // Fallback: Show custom modal for iOS Safari
      alert(
        "To install this app:\n\n1. Tap the Share button in Safari.\n2. Select 'Add to Home Screen'."
      )
      return
    }

    // Cast event to correct type
    const promptEvent = deferredPrompt as any
    promptEvent.prompt()

    const { outcome } = await promptEvent.userChoice
    console.log(`User response: ${outcome}`)

    setDeferredPrompt(null)
  }

  return { installPwa }
}
