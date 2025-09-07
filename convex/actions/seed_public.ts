'use node'

import { v } from 'convex/values'
import { api } from '../_generated/api'
import { action } from '../_generated/server'

export const seedAllToPublicBoard: any = action({
  args: {
    ownerKey: v.string(), // e.g. "seed" or your own ownerKey
    boardSlug: v.optional(v.string()), // default: "discover"
    limit: v.optional(v.number()) // optional cap
  },
  handler: async (ctx, { ownerKey, boardSlug = 'discover', limit }) => {
    // 1) Ensure the public board exists and is public
    let board = await ctx.runQuery(api.boards.getByOwnerAndSlug, {
      ownerKey,
      slug: boardSlug
    })
    if (!board) {
      const id = await ctx.runMutation(api.boards.create, {
        ownerKey,
        name: boardSlug === 'discover' ? 'Discover' : boardSlug,
        slug: boardSlug,
        isPublic: true
      })
      board = await ctx.runQuery(api.boards.getByOwnerAndSlug, {
        ownerKey,
        slug: boardSlug
      })
    } else if (!board.isPublic) {
      await ctx.runMutation(api.boards.setPublic, {
        id: board._id,
        isPublic: true
      })
    }

    // 2) Get all website ids (or limited set)
    const websiteIds = await ctx.runQuery(api.websites.listIds, { limit })

    // 3) Add each website to that board (dedup + counters happen inside mutation)
    let added = 0,
      deduped = 0,
      failed = 0
    for (const websiteId of websiteIds) {
      try {
        const res = await ctx.runMutation(api.boardItems.addToBoard, {
          ownerKey,
          boardId: board!._id,
          websiteId
        })
        if (res?.deduped) deduped++
        else added++
      } catch (_e) {
        failed++
      }
    }

    return {
      boardId: board!._id,
      total: websiteIds.length,
      added,
      deduped,
      failed
    }
  }
})
