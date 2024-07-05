import { pgTable } from "@/db/utils"
import { sql } from "drizzle-orm"
import {
  json,
  pgEnum,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { databasePrefix } from "@/lib/constants"

export const statusEnum = pgEnum(`${databasePrefix}_status`, [
  "todo",
  "in-progress",
  "done",
  "canceled",
])

export const labelEnum = pgEnum(`${databasePrefix}_label`, [
  "bug",
  "feature",
  "enhancement",
  "documentation",
])

export const priorityEnum = pgEnum(`${databasePrefix}_priority`, [
  "low",
  "medium",
  "high",
])

export const tasks = pgTable("tasks", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
  code: varchar("code", { length: 256 }).notNull().unique(),
  title: varchar("title", { length: 256 }),
  status: statusEnum("status").notNull().default("todo"),
  label: labelEnum("label").notNull().default("bug"),
  priority: priorityEnum("priority").notNull().default("low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
})

export type Task = typeof tasks.$inferSelect
export type NewTask = typeof tasks.$inferInsert

export const views = pgTable("views", {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v4()`)
    .notNull(),
  name: text("name").notNull().unique(),
  columns: text("columns").array(),
  filters: json("filters").$type<object>().array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .default(sql`current_timestamp`)
    .$onUpdate(() => new Date()),
})

export type Views = typeof views.$inferSelect
