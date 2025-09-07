import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

// ...your existing tables...

export default defineSchema({
  // ...existing tables...

  waitlist: defineTable({
    email: v.string(), // unique by code (we enforce in mutation)
    name: v.optional(v.string()),
    source: v.optional(v.string()), // e.g. "landing", "cta-footer"
    ref: v.optional(v.string()), // referral code that invited them
    referralCode: v.string(), // unique human-readable code for sharing
    createdAt: v.number(), // Date.now()
    updatedAt: v.number()
  })
    .index('by_email', ['email'])
    .index('by_referralCode', ['referralCode'])
    .index('by_createdAt', ['createdAt'])
})
