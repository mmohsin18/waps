'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation, useQuery } from 'convex/react'
import { Check, Copy, Loader2, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'

function emailOk(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export default function WaitlistForm({ source }: { source?: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [success, setSuccess] = useState<{
    referralCode: string
    position: number
    total: number
  } | null>(null)

  const join = useMutation(api.waitlist.join)
  const stats = useQuery(api.waitlist.stats, {})

  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const refUrl = success ? `${origin}/?ref=${success.referralCode}` : ''

  const disabled = busy || !emailOk(email)

  const ambientBg =
    'radial-gradient(1000px 600px at 10% -10%, rgba(255,107,87,0.14), transparent 60%), ' +
    'radial-gradient(900px 600px at 110% 10%, rgba(255,176,87,0.10), transparent 50%), #0B0B10'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!emailOk(email)) {
      setErr('Please enter a valid email address.')
      return
    }
    setErr(null)
    setBusy(true)
    setSuccess(null)

    try {
      const res = await join({
        email: email.trim(),
        name: name.trim() || undefined,
        source,
        ref:
          new URLSearchParams(
            typeof window !== 'undefined' ? window.location.search : ''
          ).get('ref') || undefined
      })

      setSuccess({
        referralCode: res.referralCode,
        position: res.position,
        total: res.total
      })
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className='w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl'
      style={{ background: 'rgba(18,18,22,0.6)' }}
    >
      <div className='mb-4 text-center'>
        <h2 className='text-lg font-semibold'>Join the Waps waitlist</h2>
        <p className='text-sm text-white/70'>
          Be first to try “Your bookmarking buddy”.{` `}
          <span className='hidden opacity-80'>
            {stats ? `(${stats.total.toLocaleString()} already signed up)` : ''}
          </span>
        </p>
      </div>

      <form onSubmit={onSubmit} className='space-y-3'>
        <label className='block'>
          <div className='mb-1 text-xs uppercase tracking-wide text-white/70'>
            Email
          </div>
          <div className='flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur'>
            <Mail size={16} className='text-white/80' />
            <Input
              type='email'
              value={email}
              onChange={e => setEmail(e.currentTarget.value)}
              placeholder='you@example.com'
              className='h-9 border-0 bg-transparent px-0 placeholder:text-white/60 focus-visible:ring-0'
              required
            />
          </div>
        </label>

        <label className='hidden'>
          <div className='mb-1 text-xs uppercase tracking-wide text-white/70'>
            Name (optional)
          </div>
          <div className='flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur'>
            <User size={16} className='text-white/80' />
            <Input
              value={name}
              onChange={e => setName(e.currentTarget.value)}
              placeholder='Your name'
              className='h-9 border-0 bg-transparent px-0 placeholder:text-white/60 focus-visible:ring-0'
            />
          </div>
        </label>

        {err && <div className='text-sm text-red-300'>{err}</div>}

        <Button
          type='submit'
          disabled={disabled}
          className='w-full text-white'
          style={{ background: 'linear-gradient(135deg, #FF6B57, #FF8F69)' }}
        >
          {busy ? (
            <span className='inline-flex items-center gap-2'>
              <Loader2 size={16} className='animate-spin' /> Joining…
            </span>
          ) : (
            'Join the waitlist'
          )}
        </Button>
      </form>

      {success && (
        <SuccessCard
          referralLink={refUrl}
          position={success.position}
          total={success.total}
        />
      )}
    </div>
  )
}

function SuccessCard({
  referralLink,
  position,
  total
}: {
  referralLink: string
  position: number
  total: number
}) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // ignore
    }
  }

  return (
    <div className='mt-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4'>
      <div className='text-sm'>
        You’re <span className='font-semibold'>#{position}</span> in line of{' '}
        <span className='font-semibold'>{total}</span>.
      </div>
      {referralLink && (
        <>
          <div className='mt-2 text-xs text-white/80'>Your referral link</div>
          <div className='mt-1 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2'>
            <code className='min-w-0 shrink overflow-hidden text-ellipsis text-xs'>
              {referralLink}
            </code>
            <button
              onClick={copy}
              className='ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-white/10'
              aria-label='Copy referral link'
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span className='text-xs'>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
