"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { View } from "@/db/schema"
import type { DataTableFilterField, DataTableFilterOption } from "@/types"
import { CaretSortIcon, PlusIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"
import isEqual from "lodash.isequal"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DataTableFilterCombobox } from "@/components/data-table/advanced/data-table-filter-combobox"
import { DataTableColumnsVisibility } from "@/components/data-table/data-table-columns-visibility"
import type { SearchParams } from "@/app/_lib/validations"

import { DataTableFilterItem } from "./data-table-filter-item"
import { DataTableMultiFilter } from "./data-table-multi-filter"
import { CreateViewPopover } from "./views/create-view-popover"
import { DataTableViewsDropdown } from "./views/data-table-views-dropdown"
import UpdateViewForm from "./views/update-view-form"
import {
  calcFilterParams,
  calcViewSearchParamsURL,
  getIsFiltered,
} from "./views/utils"

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>
  filterFields?: DataTableFilterField<TData>[]
  views: Omit<View, "createdAt" | "updatedAt">[]
}

export function DataTableAdvancedToolbar<TData>({
  table,
  filterFields = [],
  views,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const options = React.useMemo<DataTableFilterOption<TData>[]>(() => {
    return filterFields.map((field) => {
      return {
        id: crypto.randomUUID(),
        label: field.label,
        value: field.value,
        options: field.options ?? [],
      }
    })
  }, [filterFields])

  const initialSelectedOptions = React.useMemo(() => {
    return options
      .filter((option) => searchParams.has(option.value as string))
      .map((option) => {
        const value = searchParams.get(String(option.value)) as string
        const [filterValue, filterOperator, isMulti] =
          value?.split("~").filter(Boolean) ?? []

        return {
          ...option,
          filterValues: filterValue?.split(".") ?? [],
          filterOperator,
          isMulti: !!isMulti,
        }
      })
  }, [options, searchParams])

  const [selectedOptions, setSelectedOptions] = React.useState<
    DataTableFilterOption<TData>[]
  >(initialSelectedOptions)
  const [openFilterBuilder, setOpenFilterBuilder] = React.useState(
    initialSelectedOptions.length > 0 || false
  )
  const [openCombobox, setOpenCombobox] = React.useState(false)

  function onFilterComboboxItemSelect() {
    setOpenFilterBuilder(true)
    setOpenCombobox(true)
  }

  const multiFilterOptions = React.useMemo(
    () => selectedOptions.filter((option) => option.isMulti),
    [selectedOptions]
  )

  const selectableOptions = options.filter(
    (option) =>
      !selectedOptions.some(
        (selectedOption) => selectedOption.value === option.value
      )
  )

  const isFiltered = getIsFiltered(searchParams)

  const currentView = views.find(
    (view) => view.id === searchParams.get("viewId")
  )

  const filterParams = calcFilterParams(selectedOptions, searchParams)

  const isUpdated = !isEqual(currentView?.filterParams, filterParams)

  function resetToCurrentView() {
    if (!currentView) return

    const searchParamsURL = calcViewSearchParamsURL(currentView)
    router.push(`${pathname}?${searchParamsURL}`)
  }

  // Update table state when search params are changed
  React.useEffect(() => {
    const searchParamsObj = Object.fromEntries(searchParams)
    const newSelectedOptions: DataTableFilterOption<TData>[] = []

    for (const [key, value] of Object.entries(searchParamsObj) as [
      keyof SearchParams,
      string,
    ][]) {
      const option = options.find((option) => option.value === key)
      if (!option) continue

      const [filterValue, comparisonOperator, isMulti] = value.split("~") ?? []
      newSelectedOptions.push({
        ...option,
        filterValues: filterValue?.split(".") ?? [],
        filterOperator: comparisonOperator,
        isMulti: !!isMulti,
      })
    }

    setSelectedOptions(newSelectedOptions)
    if (newSelectedOptions.length > 0) {
      setOpenFilterBuilder(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div
      className={cn(
        "flex w-full flex-col space-y-2.5 overflow-auto py-1",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <DataTableViewsDropdown views={views} filterParams={filterParams} />

        <div className="flex items-center gap-2">
          {children}
          {(options.length > 0 && selectedOptions.length > 0) ||
          openFilterBuilder ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpenFilterBuilder(!openFilterBuilder)}
            >
              <CaretSortIcon
                className="mr-2 size-4 shrink-0"
                aria-hidden="true"
              />
              Filter
            </Button>
          ) : (
            <DataTableFilterCombobox
              selectableOptions={selectableOptions}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              onSelect={onFilterComboboxItemSelect}
            />
          )}
          <DataTableColumnsVisibility table={table} />
        </div>
      </div>
      <div
        className={cn(
          "flex h-8 items-center gap-2",
          !openFilterBuilder && "hidden"
        )}
      >
        {selectedOptions
          .filter((option) => !option.isMulti)
          .map((selectedOption) => (
            <DataTableFilterItem
              key={String(selectedOption.value)}
              table={table}
              selectedOption={selectedOption}
              setSelectedOptions={setSelectedOptions}
              defaultOpen={openCombobox}
            />
          ))}
        {selectedOptions.some((option) => option.isMulti) ? (
          <DataTableMultiFilter
            table={table}
            allOptions={options}
            options={multiFilterOptions}
            setSelectedOptions={setSelectedOptions}
            defaultOpen={openCombobox}
          />
        ) : null}
        {selectableOptions.length > 0 ? (
          <DataTableFilterCombobox
            selectableOptions={selectableOptions}
            selectedOptions={selectedOptions}
            setSelectedOptions={setSelectedOptions}
            onSelect={onFilterComboboxItemSelect}
          >
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              className="h-7 rounded-full"
              onClick={() => setOpenCombobox(true)}
            >
              <PlusIcon className="mr-2 size-4 opacity-50" aria-hidden="true" />
              Add filter
            </Button>
          </DataTableFilterCombobox>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {isUpdated && currentView && (
            <Button variant="ghost" size="sm" onClick={resetToCurrentView}>
              Reset
            </Button>
          )}

          {isFiltered && !currentView && (
            <CreateViewPopover selectedOptions={selectedOptions} />
          )}

          {isUpdated && currentView && (
            <UpdateViewForm
              currentView={currentView}
              filterParams={filterParams}
            />
          )}
        </div>
      </div>
    </div>
  )
}
