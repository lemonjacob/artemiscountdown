import { mutation, query } from "./_generated/server"
import { v } from "convex/values"

export const getLaunchDate = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query("missionConfig")
      .withIndex("by_key", (q) => q.eq("key", "launchDate"))
      .unique()
    return config?.value ?? null
  },
})

export const setLaunchDate = mutation({
  args: { value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("missionConfig")
      .withIndex("by_key", (q) => q.eq("key", "launchDate"))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value })
    } else {
      await ctx.db.insert("missionConfig", { key: "launchDate", value: args.value })
    }
  },
})
