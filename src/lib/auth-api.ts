export type MeResponse = {
  user: { id: string; email: string; name?: string | null } | null
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store'
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok)
    throw new Error((data as any)?.error || `Request failed (${res.status})`)
  return data as T
}

export const signIn = (email: string, password: string) =>
  api<{ ok: true }>('/api/manual-auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

export const signUp = (name: string, email: string, password: string) =>
  api<{ ok: true }>('/api/manual-auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password })
  })

export const fetchMe = () => api<MeResponse>('/api/manual-auth/me')

export const signOut = () =>
  api<{ ok: true }>('/api/manual-auth/signout', { method: 'POST' })
