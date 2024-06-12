import { siteConfig } from '@/config/site'
import Link from 'next/link'
import { Icons } from './icons'

export default function SiteFooter() {
  return (
    <footer className='container mt-20 flex h-14 flex-col-reverse items-center justify-between md:flex-row'>
      <p className='text-muted-foreground text-balance text-center text-xs leading-loose md:text-left md:text-sm'>
        © 2024 Masagus Hariadi Arief.
      </p>
      <div className='flex gap-2 self-center justify-self-center'>
        <Link href={siteConfig.links.github} target='_blank' rel='noreferrer'>
          <Icons.gitHub className='h-4 w-4' />
          <span className='sr-only'>GitHub</span>
        </Link>
        <Link href={siteConfig.links.twitter} target='_blank' rel='noreferrer'>
          <Icons.twitter className='h-4 w-4 fill-current' />
          <span className='sr-only'>Twitter</span>
        </Link>
        <Link href={siteConfig.links.linkedin} target='_blank' rel='noreferrer'>
          <Icons.linkedin className='h-4 w-4 fill-current' />
          <span className='sr-only'>LinkedIn</span>
        </Link>
      </div>
    </footer>
  )
}
