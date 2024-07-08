"use client"

import { type Task } from "@/db/schema"
import { DownloadIcon } from "@radix-ui/react-icons"
import { type Table } from "@tanstack/react-table"
import { useHotkeys } from "react-hotkeys-hook"

import { exportTableToCSV } from "@/lib/export"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Kbd } from "@/components/kbd"

import { CreateTaskDialog } from "./create-task-dialog"
import { DeleteTasksDialog } from "./delete-tasks-dialog"

interface TasksTableToolbarActionsProps {
  table: Table<Task>
}

export function TasksTableToolbarActions({
  table,
}: TasksTableToolbarActionsProps) {
  useHotkeys("shift+e", () =>
    exportTableToCSV(table, {
      filename: "tasks",
      excludeColumns: ["select", "actions"],
    })
  )

  return (
    <div className="flex items-center gap-2">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <DeleteTasksDialog
          tasks={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          onSuccess={() => table.toggleAllRowsSelected(false)}
        />
      ) : null}
      <CreateTaskDialog />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                exportTableToCSV(table, {
                  filename: "tasks",
                  excludeColumns: ["select", "actions"],
                })
              }
            >
              <DownloadIcon className="mr-2 size-4" aria-hidden="true" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2 border bg-accent font-semibold text-foreground dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40">
            Export csv
            <div>
              <Kbd variant="outline">⇧</Kbd> <Kbd variant="outline">E</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/**
       * Other actions can be added here.
       * For example, import, view, etc.
       */}
    </div>
  )
}
