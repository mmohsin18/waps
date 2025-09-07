'use client'
import { useEffect } from 'react'

export default function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        // Optional: useful logs
        console.log('[PWA] SW registered:', reg.scope)
      })
      .catch(err => console.warn('[PWA] SW registration failed:', err))
  }, [])

  return null
}
