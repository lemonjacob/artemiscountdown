import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getLaunchDate = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db
      .query('missionConfig')
      .withIndex('by_key', q => q.eq('key', 'launchDate'))
      .unique()
    return config?.value ?? null
  }
})

export const setLaunchDate = mutation({
  args: { value: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('missionConfig')
      .withIndex('by_key', q => q.eq('key', 'launchDate'))
      .unique()
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value })
    } else {
      await ctx.db.insert('missionConfig', { key: 'launchDate', value: args.value })
    }
  }
})

// Returns { isGo: boolean, goTime: number | null } where goTime is ms epoch when "go" was last set
export const getTerminalCountGo = query({
  args: {},
  handler: async (ctx) => {
    const goFlag = await ctx.db
      .query('missionConfig')
      .withIndex('by_key', q => q.eq('key', 'terminalCountGoFlag'))
      .unique()
    const goTime = await ctx.db
      .query('missionConfig')
      .withIndex('by_key', q => q.eq('key', 'terminalCountGoTime'))
      .unique()
    return {
      isGo: goFlag?.value === 'true',
      goTime: goTime?.value != null ? Number(goTime.value) : null
    }
  }
})

// Sets go/no-go for terminal count entry. Always records the edit timestamp.
export const setTerminalCountGo = mutation({
  args: { isGo: v.boolean() },
  handler: async (ctx, args) => {
    const now = Date.now().toString()

    const existingFlag = await ctx.db
      .query('missionConfig')
      .withIndex('by_key', q => q.eq('key', 'terminalCountGoFlag'))
      .unique()
    if (existingFlag) {
      await ctx.db.patch(existingFlag._id, { value: args.isGo ? 'true' : 'false' })
    } else {
      await ctx.db.insert('missionConfig', { key: 'terminalCountGoFlag', value: args.isGo ? 'true' : 'false' })
    }

    const existingTime = await ctx.db
      .query('missionConfig')
      .withIndex('by_key', q => q.eq('key', 'terminalCountGoTime'))
      .unique()
    if (existingTime) {
      await ctx.db.patch(existingTime._id, { value: now })
    } else {
      await ctx.db.insert('missionConfig', { key: 'terminalCountGoTime', value: now })
    }
  }
})
