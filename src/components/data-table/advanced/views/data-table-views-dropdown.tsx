import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
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
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import type { FilterParams } from "@/app/_lib/validations"

import { CreateViewForm } from "./create-view-form"
import { EditViewForm } from "./edit-view-form"
import { calcViewSearchParamsURL } from "./utils"

export type ViewItem = Omit<View, "createdAt" | "updatedAt">

interface DataTableViewsDropdownProps {
  views: ViewItem[]
  filterParams: FilterParams
}

export function DataTableViewsDropdown({
  views,
  filterParams,
}: DataTableViewsDropdownProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState(false)
  const [isCreateViewFormOpen, setIsCreateViewFormOpen] = useState(false)
  const [isEditViewFormOpen, setIsEditViewFormOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<ViewItem | null>(null)

  const currentView = views.find(
    (view) => view.id === searchParams.get("viewId")
  )

  function selectView(view: ViewItem) {
    const searchParamsURL = calcViewSearchParamsURL(view)
    router.push(`${pathname}?${searchParamsURL}`)
  }

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
          className="flex w-36 justify-between"
        >
          <span className="truncate">{currentView?.name || "All tasks"}</span>
          <CaretDownIcon aria-hidden="true" className="size-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[12.5rem] p-0 dark:bg-background/95 dark:backdrop-blur-md dark:supports-[backdrop-filter]:bg-background/40"
        align="start"
      >
        {isCreateViewFormOpen && (
          <CreateViewForm
            backButton
            onBack={() => setIsCreateViewFormOpen(false)}
            filterParams={filterParams}
            onSuccess={() => setOpen(false)}
          />
        )}

        {isEditViewFormOpen && selectedView && (
          <EditViewForm
            view={selectedView}
            setIsEditViewFormOpen={setIsEditViewFormOpen}
          />
        )}

        {!isCreateViewFormOpen && !isEditViewFormOpen && (
          <Command className="dark:bg-transparent">
            <CommandInput placeholder="View name" />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup className="max-h-48">
                <CommandItem
                  value="All tasks"
                  onSelect={() => {
                    router.push(pathname)
                    setOpen(false)
                  }}
                >
                  All tasks
                </CommandItem>
                {views.map((view) => (
                  <CommandItem
                    key={view.id}
                    value={view.name}
                    className="group justify-between"
                    onSelect={() => {
                      selectView(view)
                      setOpen(false)
                    }}
                  >
                    {view.name}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="invisible size-5 hover:bg-neutral-200 group-hover:visible dark:hover:bg-neutral-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsEditViewFormOpen(true)
                        setSelectedView(view)
                      }}
                    >
                      <Pencil1Icon className="size-3" />
                    </Button>
                  </CommandItem>
                ))}
              </CommandGroup>
              <Separator />
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
