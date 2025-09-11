// File: components/waps/WapCard.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useMutation } from 'convex/react'
import { ExternalLink, MoreVertical, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '../../../convex/_generated/api'

export function WapCard({ item }: { item: any }) {
  const remove = useMutation(api.waps.removeFromBoard)
  const hostname = safeHostname(
    item.website.canonicalUrl || item.website.origin
  )

  return (
    <Card className='waps-card waps-hover overflow-hidden rounded-2xl'>
      <CardHeader className='pb-2'>
        <div className='flex items-start gap-3'>
          {/* favicon */}
          <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/15'>
            {item.website.faviconUrl ? (
              <Image
                src={item.website.faviconUrl}
                alt='favicon'
                fill
                sizes='40px'
                className='object-contain p-1.5'
              />
            ) : (
              <div className='grid h-full w-full place-items-center text-xs text-white/90'>
                {hostname[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* title & host */}
          <div className='min-w-0 flex-1'>
            <CardTitle className='truncate text-[15px] font-semibold text-white'>
              {item.website.title || hostname}
            </CardTitle>
            <p className='truncate text-xs text-white/60'>{hostname}</p>
          </div>

          {/* menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='rounded-lg p-2 hover:bg-white/10'>
                <MoreVertical className='h-4 w-4 text-white/80' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='waps-card rounded-xl'>
              <DropdownMenuItem
                className='text-red-300 focus:bg-white/10'
                onClick={() =>
                  remove({ ownerKey: getOwnerKey(), boardItemId: item._id })
                }
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Remove from board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className='pt-2'>
        {/* chips */}
        {item.website.categories?.length ? (
          <div className='mb-3 flex flex-wrap gap-1.5'>
            {item.website.categories.slice(0, 3).map((t: string) => (
              <span key={t} className='waps-chip'>
                {t}
              </span>
            ))}
            {item.website.categories.length > 3 && (
              <span className='waps-chip opacity-80'>
                +{item.website.categories.length - 3}
              </span>
            )}
          </div>
        ) : null}

        {/* actions */}
        <div className='flex gap-2'>
          <Button asChild size='sm' className='waps-btn h-9 flex-1 rounded-xl'>
            <Link
              href={item.website.canonicalUrl}
              target='_blank'
              rel='noopener noreferrer'
            >
              Open <ExternalLink className='ml-1 h-4 w-4' />
            </Link>
          </Button>
          <Button
            asChild
            variant='outline'
            size='sm'
            className='h-9 rounded-xl border border-white/15 text-white hover:bg-white/10'
          >
            <Link href={`/site/${item.website.slug}`}>Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}
function getOwnerKey() {
  try {
    return (
      localStorage.getItem('waps.ownerKey') ||
      localStorage.getItem('ownerKey') ||
      ''
    )
  } catch {
    return ''
  }
}
