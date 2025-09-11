'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, CheckCircle2, Loader2, Mail } from 'lucide-react'
import { useState } from 'react'

type State = 'idle' | 'sending' | 'success' | 'error'

export default function ContactPage() {
  const [state, setState] = useState<State>('idle')
  const [err, setErr] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  // Anti-bot honeypot; should stay empty
  const [company, setCompany] = useState('')

  const ambient =
    'radial-gradient(1000px 600px at 10% -10%, rgba(255,107,87,0.18), transparent 60%), ' +
    'radial-gradient(900px 600px at 110% 10%, rgba(255,176,87,0.12), transparent 50%), #0B0B10'

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null)
    setState('sending')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          company // honeypot
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error ?? 'Failed to send. Try again.')
      }

      setState('success')
      setName('')
      setEmail('')
      setSubject('')
      setMessage('')
      setCompany('')
    } catch (e) {
      setState('error')
      setErr(e instanceof Error ? e.message : 'Something went wrong.')
    }
  }

  return (
    <main
      className='min-h-dvh px-4 pb-24 pt-6 text-white'
      style={{ background: ambient }}
    >
      <div className='mx-auto w-full max-w-screen-sm space-y-5'>
        {/* Card header */}
        <div className='rounded-3xl border border-white/15 bg-white/10 p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl'>
          <div className='flex items-center gap-3'>
            <div
              className='grid h-11 w-11 place-items-center rounded-2xl'
              style={{
                background: 'linear-gradient(135deg, #FF6B57, #FFB057)'
              }}
            >
              <Mail className='h-5 w-5 text-white' />
            </div>
            <div>
              <h1 className='text-lg font-semibold leading-tight'>
                Contact us
              </h1>
              <p className='text-xs text-white/70'>
                Have a question about Waps? Send us a note.
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className='mt-5 space-y-4'>
            <Field label='Name'>
              <Input
                value={name}
                onChange={e => setName(e.currentTarget.value)}
                placeholder='Your name'
                className='h-9 border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0'
                required
              />
            </Field>

            <Field label='Email'>
              <Input
                type='email'
                value={email}
                onChange={e => setEmail(e.currentTarget.value)}
                placeholder='you@example.com'
                className='h-9 border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0'
                required
              />
            </Field>

            <Field label='Subject'>
              <Input
                value={subject}
                onChange={e => setSubject(e.currentTarget.value)}
                placeholder='What’s this about?'
                className='h-9 border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0'
              />
            </Field>

            <Field label='Message'>
              <Textarea
                value={message}
                onChange={e => setMessage(e.currentTarget.value)}
                placeholder='Tell us a little more…'
                rows={6}
                className='border-0 bg-transparent text-white placeholder:text-white/60 focus-visible:ring-0'
                required
              />
            </Field>

            {/* Honeypot (hidden) */}
            <div className='hidden'>
              <label>
                Company
                <input
                  value={company}
                  onChange={e => setCompany(e.currentTarget.value)}
                />
              </label>
            </div>

            {/* Status */}
            {state === 'error' && (
              <p className='flex items-center gap-2 text-sm text-red-300'>
                <AlertTriangle className='h-4 w-4' /> {err || 'Failed to send.'}
              </p>
            )}
            {state === 'success' && (
              <p className='flex items-center gap-2 text-sm text-emerald-300'>
                <CheckCircle2 className='h-4 w-4' /> Thanks! We’ll get back to
                you soon.
              </p>
            )}

            <Button
              type='submit'
              disabled={state === 'sending'}
              className='w-full text-white'
              style={{
                background: 'linear-gradient(135deg, #FF6B57, #FF8F69)'
              }}
            >
              {state === 'sending' ? (
                <span className='inline-flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' /> Sending…
                </span>
              ) : (
                'Send message'
              )}
            </Button>
          </form>
        </div>

        <div className='text-center text-xs text-white/60'>
          We usually respond within 1–2 business days.
        </div>
      </div>
    </main>
  )
}

function Field({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className='block'>
      <div className='mb-1 text-xs uppercase tracking-wide text-white/70'>
        {label}
      </div>
      <div className='rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur'>
        {children}
      </div>
    </label>
  )
}
