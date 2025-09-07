'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Rocket } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

// Optional: pass an ETA date and an async joinWaitlist(email) handler
type Props = {
  title?: string
  subtitle?: string
  eta?: Date | string // e.g., "2025-10-01T00:00:00Z"
  onJoin?: (email: string) => Promise<void> | void
}

export default function ComingSoon({
  title = 'Waps',
  subtitle = 'Your bookmarking buddy',
  eta,
  onJoin
}: Props) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // ---- countdown (optional) ----
  const target = useMemo(() => (eta ? new Date(eta) : null), [eta])
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    if (!target) return
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [target])

  const countdown = useMemo(() => {
    if (!target) return null
    const diff = Math.max(0, target.getTime() - now.getTime())
    const s = Math.floor(diff / 1000)
    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return { d, h, m, s: sec }
  }, [target, now])

  // ---- submit ----
  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    const ok = /^\S+@\S+\.\S+$/.test(email)
    if (!ok) {
      setErr('Please enter a valid email.')
      return
    }
    try {
      setBusy(true)
      if (onJoin) {
        await onJoin(email)
      } else {
        // fallback no-op
        await new Promise(r => setTimeout(r, 600))
      }
      setMsg("You're on the list! 🎉")
      setEmail('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const ambient =
    'radial-gradient(1000px 600px at 10% -10%, rgba(255,107,87,0.18), transparent 60%), ' +
    'radial-gradient(900px 600px at 110% 10%, rgba(255,176,87,0.12), transparent 50%), #0B0B10'

  return (
    <section
      className='grid min-h-dvh place-items-center p-6 text-white'
      style={{ background: ambient }}
    >
      <div className='w-full max-w-md'>
        {/* Card */}
        <div className='relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl'>
          {/* top hairline */}
          <div className='absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/40 to-transparent' />

          {/* Header */}
          <div className='flex items-center gap-3'>
            <div
              className='grid h-11 w-11 place-items-center rounded-2xl text-sm font-black'
              style={{
                background: 'linear-gradient(135deg, #FF6B57, #FFB057)'
              }}
            >
              W
            </div>
            <div>
              <h1 className='text-lg font-semibold leading-tight'>{title}</h1>
              <p className='text-xs text-white/70'>{subtitle}</p>
            </div>
            <div className='ml-auto hidden sm:block'>
              <Rocket className='h-5 w-5 text-white/70' />
            </div>
          </div>

          {/* Big headline */}
          <div className='mt-5'>
            <div className='text-2xl font-bold'>Coming soon</div>
            <p className='mt-1 text-sm text-white/80'>
              Explore, save and share websites as if they were apps.
            </p>
          </div>

          {/* Countdown */}
          {countdown && (
            <div className='mt-4 grid grid-cols-4 gap-2'>
              {[
                ['Days', countdown.d],
                ['Hours', countdown.h],
                ['Mins', countdown.m],
                ['Secs', countdown.s]
              ].map(([label, val]) => (
                <div
                  key={label as string}
                  className='rounded-2xl border border-white/10 bg-white/10 p-3 text-center backdrop-blur'
                >
                  <div className='text-2xl font-extrabold tabular-nums'>
                    {String(val).padStart(2, '0')}
                  </div>
                  <div className='text-[10px] uppercase tracking-wide text-white/70'>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Features mini-list */}
          <ul className='mt-5 space-y-2 text-sm text-white/85'>
            <li className='flex items-center gap-2'>
              <span className='inline-block h-1.5 w-1.5 rounded-full bg-orange-400' />
              Play-Store-like explore of public boards
            </li>
            <li className='flex items-center gap-2'>
              <span className='inline-block h-1.5 w-1.5 rounded-full bg-red-400' />
              Personal boards with offline sync
            </li>
            <li className='flex items-center gap-2'>
              <span className='inline-block h-1.5 w-1.5 rounded-full bg-amber-400' />
              AI summaries when you paste a URL
            </li>
          </ul>

          {/* Waitlist form */}
          <form onSubmit={handleJoin} className='mt-6 space-y-2'>
            <label className='text-xs uppercase tracking-wide text-white/70'>
              Join the waitlist
            </label>
            <div className='flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur'>
              <Mail className='h-4 w-4 text-white/70' />
              <Input
                type='email'
                value={email}
                onChange={e => setEmail(e.currentTarget.value)}
                placeholder='you@example.com'
                className='h-9 border-0 bg-transparent px-0 text-white placeholder:text-white/60 focus-visible:ring-0'
              />
            </div>
            {err && <p className='text-xs text-red-300'>{err}</p>}
            {msg && <p className='text-xs text-emerald-300'>{msg}</p>}
            <Button
              type='submit'
              disabled={busy || !email}
              className='w-full text-white'
              style={{
                background: 'linear-gradient(135deg, #FF6B57, #FF8F69)'
              }}
            >
              {busy ? 'Joining…' : 'Get early access'}
            </Button>
          </form>

          {/* APK teaser */}
          <div className='mt-6 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm'>
            Want the APK when we drop it? It’ll arrive in your inbox if you’re
            on the list.
          </div>
        </div>

        {/* Footer */}
        <div className='mt-4 text-center text-xs text-white/60'>
          © {new Date().getFullYear()} Waps. All rights reserved.
        </div>
      </div>
    </section>
  )
}
