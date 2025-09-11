// utils/isPwaInstalled.ts
export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined')
    return false // SSR/SSG guard
  const displayModeStandalone =
    window.matchMedia?.('(display-mode: standalone)').matches === true
  const iosStandalone = (navigator as any).standalone === true // iOS Safari
  const fromAndroidApp =
    document.referrer?.startsWith('android-app://') === true
  return displayModeStandalone || iosStandalone || fromAndroidApp
}
