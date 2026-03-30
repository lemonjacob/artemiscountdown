import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("statusMessages").withIndex("by_order").take(50)
  },
})

export const create = mutation({
  args: {
    content: v.string(),
    isVisible: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("statusMessages", args)
  },
})

export const update = mutation({
  args: {
    id: v.id("statusMessages"),
    content: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args
    const updates = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    )
    await ctx.db.patch(id, updates)
  },
})

export const remove = mutation({
  args: { id: v.id("statusMessages") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
