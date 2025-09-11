export const runtime = 'nodejs'

import { ConvexHttpClient } from 'convex/browser'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { api } from '../../../../../convex/_generated/api'

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET() {
  const token = cookies().get('waps_session')?.value
  if (!token) return NextResponse.json({ user: null })
  const data = await client.query(api.authManual.sessionUser, { token })
  return NextResponse.json(data)
}
