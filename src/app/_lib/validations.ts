import { tasks } from "@/db/schema"
import * as z from "zod"

export const searchParamsSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
  viewId: z.string().uuid().optional(),
})

export type SearchParams = z.infer<typeof searchParamsSchema>

export const getTasksSchema = searchParamsSchema

export type GetTasksSchema = z.infer<typeof getTasksSchema>

export const createTaskSchema = z.object({
  title: z.string(),
  label: z.enum(tasks.label.enumValues),
  status: z.enum(tasks.status.enumValues),
  priority: z.enum(tasks.priority.enumValues),
})

export type CreateTaskSchema = z.infer<typeof createTaskSchema>

export const updateTaskSchema = z.object({
  title: z.string().optional(),
  label: z.enum(tasks.label.enumValues).optional(),
  status: z.enum(tasks.status.enumValues).optional(),
  priority: z.enum(tasks.priority.enumValues).optional(),
})

export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>

export const createViewSchema = z.object({
  name: z.string().min(1),
  columns: z.string().array().optional(),
  filterParams: z.object({
    operator: z.enum(["and", "or"]).optional(),
    sort: z.string(),
    filters: z
      .object({
        field: z.enum(["title", "status", "priority"]),
        value: z.string(),
        isMulti: z.boolean().default(false),
      })
      .array()
      .optional(),
  }),
})

export type CreateViewSchema = z.infer<typeof createViewSchema>

export const editViewSchema = createViewSchema.extend({
  id: z.string().uuid(),
})

export type EditViewSchema = z.infer<typeof editViewSchema>

export const deleteViewSchema = z.object({
  id: z.string().uuid(),
})

export type DeleteViewSchema = z.infer<typeof deleteViewSchema>

export type Filter = NonNullable<
  CreateViewSchema["filterParams"]["filters"]
>[number]
