// File: app/(app)/add/AddWapClient.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { useAction, useMutation, useQuery } from 'convex/react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../../convex/_generated/api'

const SYSTEM_OWNER = 'seed'
const SYSTEM_BOARD_SLUG = 'discover'

type Status =
  | 'idle'
  | 'checking'
  | 'found'
  | 'scanning'
  | 'new'
  | 'saving'
  | 'error'

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

function normalizeToHomepage(
  input: string
): { canonicalUrl: string; origin: string } | null {
  try {
    const u = new URL(input.includes('://') ? input : `https://${input}`)
    const origin = u.hostname.replace(/^www\./, '')
    return { canonicalUrl: `https://${origin}/`, origin }
  } catch {
    return null
  }
}

function guessFavicon(origin: string) {
  return `https://www.google.com/s2/favicons?sz=64&domain=${origin}`
}

function errText(e: unknown) {
  return e instanceof Error ? e.message : String(e ?? 'Unknown error')
}

export default function AddWapClient() {
  const searchParams = useSearchParams()

  const [rawUrl, setRawUrl] = useState('')
  const normalized = useMemo(() => normalizeToHomepage(rawUrl), [rawUrl])

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')

  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [busySubmit, setBusySubmit] = useState(false)

  const url = searchParams.get('url')
  const title2 = searchParams.get('title')
  const text = searchParams.get('text')

  useEffect(() => {
    if (url) {
      setRawUrl(url)
      setTitle(title2 || '')
      setDescription(text || '')
    }
  }, [url, title2, text])

  // Convex
  const seedBoard = useQuery(api.boards.getByOwnerAndSlug, {
    ownerKey: SYSTEM_OWNER,
    slug: SYSTEM_BOARD_SLUG
  })

  const existing = useQuery(
    api.websites.getByCanonicalUrl,
    normalized?.canonicalUrl
      ? { canonicalUrl: normalized.canonicalUrl }
      : 'skip'
  )

  const ensurePublicBoard = useMutation(api.boards.ensurePublicBoard)
  const upsertWebsite = useMutation(api.websites.upsert)
  const addToBoard = useMutation(api.boardItems.addToBoard)
  const scanWithGemini = useAction(api.actions.websites.scanWithGemini)

  const scannedKeyRef = useRef<string | null>(null)

  const resetForm = () => {
    setRawUrl('')
    setTitle('')
    setSlug('')
    setCategory('')
    setDescription('')
    setFaviconUrl('')
    setStatus('idle')
    setMessage(null)
    setBusySubmit(false)
  }

  useEffect(() => {
    if (!normalized?.canonicalUrl) {
      if (rawUrl.trim()) {
        setStatus('error')
        setMessage('Invalid URL')
      } else {
        setStatus('idle')
        setMessage(null)
      }
      return
    }

    if (existing === undefined) {
      setStatus('checking')
      setMessage('Checking database…')
      return
    }

    if (existing) {
      setStatus('found')
      setMessage('Wap found in database')
      setTitle(existing.title || normalized.origin)
      setSlug(existing.slug || slugify(existing.title || normalized.origin))
      setCategory(existing.categories?.[0] || '')
      setDescription(existing.description || '')
      setFaviconUrl(existing.faviconUrl || guessFavicon(normalized.origin))
      scannedKeyRef.current = null
      return
    }

    const key = normalized.canonicalUrl
    if (scannedKeyRef.current === key) {
      setStatus('new')
      setMessage('You are adding a new Wap!!')
      return
    }

    ;(async () => {
      try {
        setStatus('scanning')
        setMessage('Scanning website for details…')
        const scanned = await scanWithGemini({ url: key })

        const t = scanned?.title || normalized.origin
        setTitle(t)
        setSlug(scanned?.slug || slugify(t))
        setCategory(scanned?.category || '')
        setDescription(
          scanned?.description ||
            'A useful website discovered via Waps. Add your own notes here.'
        )
        setFaviconUrl(scanned?.faviconUrl || guessFavicon(normalized.origin))

        scannedKeyRef.current = key
        setStatus('new')
        setMessage('You are adding a new Wap!!')
      } catch (e) {
        setStatus('error')
        setMessage(errText(e))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalized?.canonicalUrl, existing])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!normalized?.canonicalUrl) return

    setBusySubmit(true)
    setStatus('saving')
    setMessage('Saving…')

    try {
      const board =
        seedBoard ??
        (await ensurePublicBoard({
          ownerKey: SYSTEM_OWNER,
          slug: SYSTEM_BOARD_SLUG,
          name: 'Discover'
        }))

      const websiteId = await upsertWebsite({
        canonicalUrl: normalized.canonicalUrl,
        origin: normalized.origin,
        title: title.trim(),
        slug: (slug || slugify(title)).trim(),
        description: description.trim(),
        categories: category ? [category.trim()] : [],
        faviconUrl: faviconUrl || guessFavicon(normalized.origin)
      })

      await addToBoard({
        ownerKey: board.ownerKey,
        boardId: board._id,
        websiteId
      })

      setStatus('found')
      setMessage('Added to the public board!')
    } catch (e) {
      setStatus('error')
      setMessage(errText(e))
    } finally {
      resetForm()
      setBusySubmit(false)
    }
  }

  const badge = useMemo(() => {
    switch (status) {
      case 'checking':
        return (
          <Badge className='inline-flex items-center gap-1 border-zinc-700 bg-zinc-800 text-zinc-200'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' /> Checking database…
          </Badge>
        )
      case 'found':
        return (
          <Badge className='inline-flex items-center gap-1 border-emerald-500/40 bg-emerald-500/20 text-emerald-200'>
            <CheckCircle2 className='h-3.5 w-3.5' /> Wap found in database
          </Badge>
        )
      case 'scanning':
        return (
          <Badge className='inline-flex items-center gap-1 border-orange-500/40 bg-orange-500/20 text-orange-200'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' /> Scanning website…
          </Badge>
        )
      case 'new':
        return (
          <Badge className='border-violet-500/40 bg-violet-500/20 text-violet-200'>
            You are adding a new Wap!!
          </Badge>
        )
      case 'saving':
        return (
          <Badge className='inline-flex items-center gap-1 border-zinc-700 bg-zinc-800 text-zinc-200'>
            <Loader2 className='h-3.5 w-3.5 animate-spin' /> Saving…
          </Badge>
        )
      case 'error':
        return (
          <Badge className='inline-flex items-center gap-1 border-red-500/40 bg-red-500/20 text-red-200'>
            <AlertTriangle className='h-3.5 w-3.5' />{' '}
            {message || 'Something went wrong'}
          </Badge>
        )
      default:
        return null
    }
  }, [status, message])

  const ambientBg =
    'radial-gradient(1000px 600px at 10% -10%, rgba(255,107,87,0.14), transparent 60%), ' +
    'radial-gradient(900px 600px at 110% 10%, rgba(255,176,87,0.10), transparent 50%), #0B0B10'

  return (
    <main
      className='min-h-dvh px-4 pb-24 pt-3 text-white'
      style={{ background: ambientBg }}
    >
      <div className='mx-auto w-full max-w-screen-sm space-y-5'>
        {/* … your JSX stays the same … */}
        {/* (omitted for brevity; keep exactly what you posted) */}
      </div>
    </main>
  )
}
