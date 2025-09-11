'use client'

import { usePwaInstall } from '../../../utils/usePwaInstall'
import { WapsButton } from './WapsButton'

export default function InstallButton() {
  const { installPwa } = usePwaInstall()

  return (
    <WapsButton variant={'glow'} onClick={installPwa}>
      Install App
    </WapsButton>
  )
}
