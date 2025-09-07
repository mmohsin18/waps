// convex/waitlist.ts
import { v } from 'convex/values'
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx
} from './_generated/server'

/** --- utils --- */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function generateUniqueCode(ctx: MutationCtx): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase() // e.g. F9K3PQ
    const conflict = await ctx.db
      .query('waitlist')
      .withIndex('by_referralCode', q => q.eq('referralCode', code))
      .unique()
    if (!conflict) return code
  }
  return Date.now().toString(36).toUpperCase() // fallback
}

async function countAll(ctx: QueryCtx | MutationCtx): Promise<number> {
  const all = await ctx.db.query('waitlist').collect()
  return all.length
}

/** Put range condition inside withIndex (typed & indexed). */
async function positionForCreatedAt(
  ctx: QueryCtx | MutationCtx,
  createdAt: number
): Promise<number> {
  const earlierOrEqual = await ctx.db
    .query('waitlist')
    .withIndex('by_createdAt', q => q.lte('createdAt', createdAt))
    .collect()
  return earlierOrEqual.length
}

/** Join the waitlist or return an existing row (idempotent by email). */
export const join = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    source: v.optional(v.string()),
    ref: v.optional(v.string())
  },
  handler: async (ctx, { email, name, source, ref }) => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!isValidEmail(normalizedEmail)) {
      throw new Error('Please enter a valid email address.')
    }

    // If already on the list, return their existing position + referral code
    const existing = await ctx.db
      .query('waitlist')
      .withIndex('by_email', q => q.eq('email', normalizedEmail))
      .unique()

    if (existing) {
      const [pos, total] = await Promise.all([
        positionForCreatedAt(ctx, existing.createdAt),
        countAll(ctx)
      ])
      return {
        existing: true,
        id: existing._id,
        email: existing.email,
        referralCode: existing.referralCode,
        position: pos,
        total
      }
    }

    // New signup
    const referralCode = await generateUniqueCode(ctx)
    const now = Date.now()

    const id = await ctx.db.insert('waitlist', {
      email: normalizedEmail,
      name: name?.trim(),
      source,
      ref, // (optional) store the referrer code received
      referralCode,
      createdAt: now,
      updatedAt: now
    })

    const [pos, total] = await Promise.all([
      positionForCreatedAt(ctx, now),
      countAll(ctx)
    ])

    return {
      existing: false,
      id,
      email: normalizedEmail,
      referralCode,
      position: pos,
      total
    }
  }
})

/** Aggregate stats for landing/CTA. */
export const stats = query({
  args: {},
  handler: async ctx => {
    const total = await countAll(ctx)
    return { total }
  }
})
