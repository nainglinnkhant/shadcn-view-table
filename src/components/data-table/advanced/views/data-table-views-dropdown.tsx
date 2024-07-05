import { useState } from "react"
import type { View } from "@/db/schema"
import { CaretDownIcon, Pencil1Icon, PlusIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { CreateViewForm } from "./create-view-form"
import { EditViewForm } from "./edit-view-form"

export type ViewItem = Omit<View, "createdAt" | "updatedAt">

interface DataTableViewsDialogProps {
  views: ViewItem[]
}

export function DataTableViewsDialog({ views }: DataTableViewsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isCreateViewFormOpen, setIsCreateViewFormOpen] = useState(false)
  const [isEditViewFormOpen, setIsEditViewFormOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<ViewItem | null>(null)

  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        setIsCreateViewFormOpen(false)
        setIsEditViewFormOpen(false)
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex w-36 justify-between truncate"
        >
          All tasks
          <CaretDownIcon aria-hidden="true" className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        {isCreateViewFormOpen && (
          <CreateViewForm setIsCreateViewFormOpen={setIsCreateViewFormOpen} />
        )}

        {isEditViewFormOpen && selectedView && (
          <EditViewForm
            setIsEditViewFormOpen={setIsEditViewFormOpen}
            view={selectedView}
          />
        )}

        {!isCreateViewFormOpen && !isEditViewFormOpen && (
          <Command>
            <CommandInput placeholder="View name" />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup className="max-h-48">
                <CommandItem value="All tasks" onSelect={() => {}}>
                  All tasks
                </CommandItem>
                {views.map((view) => (
                  <CommandItem
                    key={view.id}
                    value={view.name}
                    className="group justify-between"
                    onSelect={() => {}}
                  >
                    {view.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="invisible size-5 hover:bg-neutral-200 group-hover:visible dark:hover:bg-neutral-700"
                      onClick={() => {
                        setIsEditViewFormOpen(true)
                        setSelectedView(view)
                      }}
                    >
                      <Pencil1Icon className="size-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem onSelect={() => setIsCreateViewFormOpen(true)}>
                  <PlusIcon className="mr-2 size-4" aria-hidden="true" />
                  Add view
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  )
}
