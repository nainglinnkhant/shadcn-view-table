import { useState } from "react"
import { useSearchParams } from "next/navigation"
import type { DataTableFilterOption } from "@/types"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { CreateViewForm } from "./create-view-form"
import { calcFilterParams } from "./utils"

interface CreateViewPopoverProps<T> {
  selectedOptions: DataTableFilterOption<T>[]
}

export function CreateViewPopover<T>({
  selectedOptions,
}: CreateViewPopoverProps<T>) {
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)

  const filterParams = calcFilterParams(selectedOptions, searchParams)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm">Save as new view</Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[12.5rem] p-0 dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40"
        align="end"
      >
        <CreateViewForm
          filterParams={filterParams}
          onSuccess={() => setOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}
