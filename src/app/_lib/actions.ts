"use server"

import { unstable_noStore as noStore, revalidatePath } from "next/cache"
import { db } from "@/db"
import { tasks, views, type Task } from "@/db/schema"
import { takeFirstOrThrow } from "@/db/utils"
import { asc, eq, inArray, not } from "drizzle-orm"
import { customAlphabet } from "nanoid"

import { getErrorMessage } from "@/lib/handle-error"
import type { ViewItem } from "@/components/data-table/advanced/views/data-table-views-dropdown"

import { generateRandomTask } from "./utils"
import {
  createViewSchema,
  deleteViewSchema,
  editViewSchema,
  type CreateTaskSchema,
  type CreateViewSchema,
  type DeleteViewSchema,
  type EditViewSchema,
  type UpdateTaskSchema,
} from "./validations"

export type CreateFormState<T> = {
  status?: "success" | "error"
  message?: string
  errors?: Partial<Record<keyof T, string>>
}

export async function createTask(input: CreateTaskSchema) {
  noStore()
  try {
    await db.transaction(async (tx) => {
      const newTask = await tx
        .insert(tasks)
        .values({
          code: `TASK-${customAlphabet("0123456789", 4)()}`,
          title: input.title,
          status: input.status,
          label: input.label,
          priority: input.priority,
        })
        .returning({
          id: tasks.id,
        })
        .then(takeFirstOrThrow)

      // Delete a task to keep the total number of tasks constant
      await tx.delete(tasks).where(
        eq(
          tasks.id,
          (
            await tx
              .select({
                id: tasks.id,
              })
              .from(tasks)
              .limit(1)
              .where(not(eq(tasks.id, newTask.id)))
              .orderBy(asc(tasks.createdAt))
              .then(takeFirstOrThrow)
          ).id
        )
      )
    })

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateTask(input: UpdateTaskSchema & { id: string }) {
  noStore()
  try {
    await db
      .update(tasks)
      .set({
        title: input.title,
        label: input.label,
        status: input.status,
        priority: input.priority,
      })
      .where(eq(tasks.id, input.id))

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function updateTasks(input: {
  ids: string[]
  label?: Task["label"]
  status?: Task["status"]
  priority?: Task["priority"]
}) {
  noStore()
  try {
    await db
      .update(tasks)
      .set({
        label: input.label,
        status: input.status,
        priority: input.priority,
      })
      .where(inArray(tasks.id, input.ids))

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteTask(input: { id: string }) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(tasks).where(eq(tasks.id, input.id))

      // Create a new task for the deleted one
      await tx.insert(tasks).values(generateRandomTask())
    })

    revalidatePath("/")
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

export async function deleteTasks(input: { ids: string[] }) {
  try {
    await db.transaction(async (tx) => {
      await tx.delete(tasks).where(inArray(tasks.id, input.ids))

      // Create new tasks for the deleted ones
      await tx.insert(tasks).values(input.ids.map(() => generateRandomTask()))
    })

    revalidatePath("/")

    return {
      data: null,
      error: null,
    }
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    }
  }
}

type CreateViewFormState = CreateFormState<CreateViewSchema> & {
  view?: ViewItem
}

export async function createView(
  _prevState: CreateViewFormState,
  formData: FormData
): Promise<CreateViewFormState> {
  noStore()

  const name = formData.get("name")
  const columns = formData.get("columns")
    ? JSON.parse(formData.get("columns") as string)
    : undefined
  const filterParams = formData.get("filterParams")
    ? JSON.parse(formData.get("filterParams") as string)
    : undefined

  const validatedFields = createViewSchema.safeParse({
    name,
    columns,
    filterParams,
  })

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors
    return {
      status: "error",
      message: errorMap.name?.[0] ?? "",
    }
  }

  let viewId: string = ""

  try {
    await db.transaction(async (tx) => {
      const newView = await tx
        .insert(views)
        .values({
          name: validatedFields.data.name,
          columns: validatedFields.data.columns,
          filterParams: validatedFields.data.filterParams,
        })
        .returning({
          id: views.id,
        })
        .then(takeFirstOrThrow)

      viewId = newView.id

      const allViews = await db.select({ id: views.id }).from(views)
      if (allViews.length === 10) {
        await tx.delete(views).where(
          eq(
            views.id,
            (
              await tx
                .select({
                  id: views.id,
                })
                .from(views)
                .limit(1)
                .where(not(eq(views.id, newView.id)))
                .orderBy(asc(views.createdAt))
                .then(takeFirstOrThrow)
            ).id
          )
        )
      }
    })

    revalidatePath("/")

    return {
      status: "success",
      message: "View created",
      view: {
        id: viewId,
        name: validatedFields.data.name,
        columns: validatedFields.data.columns ?? null,
        filterParams: validatedFields.data.filterParams,
      },
    }
  } catch (err) {
    return {
      status: "error",
      message: getErrorMessage(err),
    }
  }
}

type EditViewFormState = CreateFormState<EditViewSchema>

export async function editView(
  _prevState: EditViewFormState,
  formData: FormData
): Promise<EditViewFormState> {
  noStore()

  const id = formData.get("id")
  const name = formData.get("name")
  const columns = formData.get("columns")
    ? JSON.parse(formData.get("columns") as string)
    : undefined
  const filterParams = formData.get("filterParams")
    ? JSON.parse(formData.get("filterParams") as string)
    : undefined

  const validatedFields = editViewSchema.safeParse({
    id,
    name,
    columns,
    filterParams,
  })

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors
    return {
      status: "error",
      message: errorMap.name?.[0] ?? "",
    }
  }

  try {
    await db
      .update(views)
      .set({
        name: validatedFields.data.name,
        columns: validatedFields.data.columns,
        filterParams: validatedFields.data.filterParams,
      })
      .where(eq(views.id, validatedFields.data.id))

    revalidatePath("/")

    return {
      status: "success",
      message: "View updated",
    }
  } catch (err) {
    if (
      typeof err === "object" &&
      err &&
      "code" in err &&
      err.code === "23505"
    ) {
      return {
        status: "error",
        message: `A view with the name "${validatedFields.data.name}" already exists`,
      }
    }

    return {
      status: "error",
      message: getErrorMessage(err),
    }
  }
}

type DeleteViewFormState = CreateFormState<DeleteViewSchema>

export async function deleteView(
  _prevState: DeleteViewFormState,
  formData: FormData
): Promise<DeleteViewFormState> {
  noStore()

  const id = formData.get("id")

  const validatedFields = deleteViewSchema.safeParse({
    id,
  })

  if (!validatedFields.success) {
    const errorMap = validatedFields.error.flatten().fieldErrors
    return {
      status: "error",
      message: errorMap.id?.[0] ?? "",
    }
  }

  try {
    await db.delete(views).where(eq(views.id, validatedFields.data.id))

    revalidatePath("/")

    return {
      status: "success",
      message: "View deleted",
    }
  } catch (err) {
    return {
      status: "error",
      message: getErrorMessage(err),
    }
  }
}
