import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const listByOwnerKey = query({
  args: { ownerKey: v.string() },
  handler: async (ctx, { ownerKey }) =>
    ctx.db
      .query('boards')
      .withIndex('by_ownerKey', q => q.eq('ownerKey', ownerKey))
      .collect()
})

export const getByOwnerAndSlug = query({
  args: { ownerKey: v.string(), slug: v.string() },
  handler: async (ctx, { ownerKey, slug }) => {
    const rows = await ctx.db
      .query('boards')
      .withIndex('by_ownerKey', q => q.eq('ownerKey', ownerKey))
      .collect()
    return rows.find(b => b.slug === slug) ?? null
  }
})

/** Create if missing, else return existing. */
export const ensurePublicBoard = mutation({
  args: {
    ownerKey: v.string(),
    slug: v.string(),
    name: v.string()
  },
  handler: async (ctx, { ownerKey, slug, name }) => {
    const existing = await ctx.db
      .query('boards')
      .withIndex('by_ownerKey', q => q.eq('ownerKey', ownerKey))
      .collect()

    const hit = existing.find(b => b.slug === slug)
    if (hit) return hit

    const now = Date.now()
    const _id = await ctx.db.insert('boards', {
      ownerKey,
      slug,
      name,
      isPublic: true,
      createdAt: now,
      updatedAt: now
    })
    const doc = await ctx.db.get(_id)
    return doc!
  }
})

export const getById = query({
  args: { id: v.id('boards') },
  handler: (ctx, { id }) => ctx.db.get(id)
})

export const create = mutation({
  args: {
    ownerKey: v.string(),
    name: v.string(),
    slug: v.string(),
    isPublic: v.boolean()
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    return await ctx.db.insert('boards', {
      ...args,
      createdAt: now,
      updatedAt: now
    })
  }
})

export const setPublic = mutation({
  args: { id: v.id('boards'), isPublic: v.boolean() },
  handler: async (ctx, { id, isPublic }) => {
    await ctx.db.patch(id, { isPublic, updatedAt: Date.now() })
  }
})

export const update = mutation({
  args: { id: v.id('boards'), isPublic: v.boolean() },
  handler: (ctx, { id, isPublic }) =>
    ctx.db.patch(id, { isPublic, updatedAt: Date.now() })
})
