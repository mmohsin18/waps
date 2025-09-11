// File: app/(app)/add/AddWapClient.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { useAction, useMutation, useQuery } from 'convex/react'
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  Loader2,
  PlusCircle
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../../../convex/_generated/api'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'

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
        {/* Header card */}
        <div className='rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-xl'>
          <div className='flex items-center gap-2'>
            <div
              className='grid h-9 w-9 place-items-center rounded-xl'
              style={{
                background: 'linear-gradient(135deg, #FF6B57, #FFB057)'
              }}
            >
              <Globe className='h-5 w-5 text-white' />
            </div>
            <div className='min-w-0'>
              <h1 className='font-semibold'>Add a website</h1>
              <p className='text-xs text-zinc-400'>
                This will be added to{' '}
                <span className='text-zinc-200'>{SYSTEM_OWNER}</span>/
                <span className='text-zinc-200'>{SYSTEM_BOARD_SLUG}</span>
              </p>
            </div>
            <div className='ml-auto'>{badge}</div>
          </div>

          <div className='mt-3 flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2'>
            <Input
              value={rawUrl}
              onChange={e => setRawUrl(e.currentTarget.value)}
              placeholder='https://example.com/page'
              className='h-9 border-0 bg-transparent px-0 placeholder:text-zinc-400 focus-visible:ring-0'
              autoFocus
            />
          </div>

          {normalized?.origin && (
            <p className='mt-2 text-xs text-zinc-400'>
              Checking homepage:{' '}
              <span className='text-zinc-200'>
                https://{normalized.origin}/
              </span>
            </p>
          )}

          {message && status !== 'error' && (
            <p className='mt-2 text-xs text-zinc-400'>{message}</p>
          )}
        </div>

        {/* Form card */}
        <form
          onSubmit={onSubmit}
          className='space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-xl'
        >
          <Field label='Title'>
            <Input
              value={title}
              onChange={e => {
                const v = e.currentTarget.value
                setTitle(v)
                if (!slug) setSlug(slugify(v))
              }}
              placeholder='Website name'
              className='h-9 border-0 bg-zinc-800/60'
            />
          </Field>

          <Field label='Slug'>
            <Input
              value={slug}
              onChange={e => setSlug(slugify(e.currentTarget.value))}
              placeholder='auto-generated-from-title'
              className='h-9 border-0 bg-zinc-800/60'
            />
          </Field>

          <Field label='Category (suggested)'>
            <Input
              value={category}
              onChange={e => setCategory(e.currentTarget.value)}
              placeholder='e.g., Productivity'
              className='h-9 border-0 bg-zinc-800/60'
            />
          </Field>

          <Field label='Description'>
            <Textarea
              value={description}
              onChange={e => setDescription(e.currentTarget.value)}
              rows={5}
              placeholder='A detailed paragraph about what the website does…'
              className='border-0 bg-zinc-800/60'
            />
          </Field>

          <Field label='Favicon URL'>
            <Input
              value={faviconUrl}
              onChange={e => setFaviconUrl(e.currentTarget.value)}
              placeholder='https://…/favicon.ico'
              className='h-9 border-0 bg-zinc-800/60'
            />
          </Field>

          <div className='pt-2'>
            <Button
              type='submit'
              disabled={
                !normalized?.canonicalUrl ||
                !title.trim() ||
                !slug.trim() ||
                !description.trim() ||
                busySubmit
              }
              className='inline-flex w-full items-center gap-2 text-white'
              style={{
                background: 'linear-gradient(135deg, #FF6B57, #FF8F69)'
              }}
            >
              {busySubmit ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' /> Saving…
                </>
              ) : status === 'found' ? (
                <>
                  <PlusCircle className='h-4 w-4' /> Add to {SYSTEM_BOARD_SLUG}
                </>
              ) : (
                <>
                  <PlusCircle className='h-4 w-4' /> Create & add
                </>
              )}
            </Button>
          </div>

          {/* Seed board availability note */}
          {seedBoard === null && (
            <p className='text-xs text-amber-300'>
              Heads up: Board <b>{SYSTEM_BOARD_SLUG}</b> for owner{' '}
              <b>{SYSTEM_OWNER}</b> was not found. Create it (public) first or
              change the constants at the top of this page.
            </p>
          )}
        </form>

        {/* Small favicon preview */}
        {faviconUrl ? (
          <div className='flex items-center gap-2 text-xs text-zinc-400'>
            <span>Favicon preview:</span>
            <img
              src={faviconUrl}
              alt=''
              width={16}
              height={16}
              className='rounded'
            />
          </div>
        ) : null}
      </div>
    </main>
  )
}

/** ---------- subcomponents ---------- */
function Field({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className='block'>
      <div className='mb-1 text-xs uppercase tracking-wide text-zinc-400'>
        {label}
      </div>
      <div className='rounded-xl border border-zinc-800 bg-zinc-900/70 p-2'>
        {children}
      </div>
    </label>
  )
}
