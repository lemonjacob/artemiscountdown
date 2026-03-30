import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  streams: defineTable({
    youtubeId: v.string(),
    label: v.string(),
    order: v.number(),
  }).index("by_order", ["order"]),

  missionConfig: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  statusMessages: defineTable({
    content: v.string(),
    isVisible: v.boolean(),
    order: v.number(),
  }).index("by_order", ["order"]),
})
