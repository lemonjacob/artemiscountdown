import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("streams").withIndex("by_order").take(20)
  },
})

export const upsert = mutation({
  args: {
    id: v.optional(v.id("streams")),
    youtubeId: v.string(),
    label: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.id) {
      await ctx.db.patch(args.id, { youtubeId: args.youtubeId, label: args.label, order: args.order })
      return args.id
    }
    return await ctx.db.insert("streams", { youtubeId: args.youtubeId, label: args.label, order: args.order })
  },
})

export const remove = mutation({
  args: { id: v.id("streams") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
