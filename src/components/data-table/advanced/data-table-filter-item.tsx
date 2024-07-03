import * as React from "react"
import type { DataTableFilterOption } from "@/types"
import { TrashIcon } from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { dataTableConfig } from "@/config/data-table"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { DataTableAdvancedFacetedFilter } from "./data-table-advanced-faceted-filter"

interface DataTableFilterItemProps<TData> {
  table: Table<TData>
  selectedOption: DataTableFilterOption<TData>
  selectedOptions: DataTableFilterOption<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  defaultOpen: boolean
}

export function DataTableFilterItem<TData>({
  table,
  selectedOption,
  selectedOptions,
  setSelectedOptions,
  defaultOpen,
}: DataTableFilterItemProps<TData>) {
  const column = table.getColumn(
    selectedOption.value ? String(selectedOption.value) : ""
  )

  const selectedValues = new Set(
    selectedOptions.find((item) => item.value === column?.id)?.filterValues
  )

  const filterValues = Array.from(selectedValues)
  const filterOperator = selectedOptions.find(
    (item) => item.value === column?.id
  )?.filterOperator

  const operators =
    selectedOption.options.length > 0
      ? dataTableConfig.selectableOperators
      : dataTableConfig.comparisonOperators

  const [value, setValue] = React.useState(filterValues[0] ?? "")
  const [open, setOpen] = React.useState(defaultOpen)
  const [selectedOperator, setSelectedOperator] = React.useState(
    operators.find((c) => c.value === filterOperator) ?? operators[0]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 gap-0 truncate rounded-full",
            (selectedValues.size > 0 || value.length > 0) && "bg-muted/50"
          )}
        >
          <span className="font-medium capitalize">{selectedOption.label}</span>
          {selectedOption.options.length > 0
            ? selectedValues.size > 0 && (
                <span className="text-muted-foreground">
                  <span className="text-foreground">: </span>
                  {selectedValues.size > 2
                    ? `${selectedValues.size} selected`
                    : selectedOption.options
                        .filter((item) => selectedValues.has(item.value))
                        .map((item) => item.label)
                        .join(", ")}
                </span>
              )
            : value.length > 0 && (
                <span className="text-muted-foreground">
                  <span className="text-foreground">: </span>
                  {value}
                </span>
              )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-1.5 p-2" align="start">
        <div className="flex items-center space-x-1 pl-1 pr-0.5">
          <div className="flex flex-1 items-center space-x-1">
            <div className="text-xs capitalize text-muted-foreground">
              {selectedOption.label}
            </div>
            <Select
              value={selectedOperator?.value}
              onValueChange={(value) =>
                setSelectedOperator(operators.find((c) => c.value === value))
              }
            >
              <SelectTrigger className="h-auto w-fit truncate border-none px-2 py-0.5 text-xs hover:bg-muted/50">
                <SelectValue placeholder={selectedOperator?.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {operators.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                      className="py-1"
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button
            aria-label="Remove filter"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => item.value !== selectedOption.value)
              )

              column?.setFilterValue("")
            }}
          >
            <TrashIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
        {selectedOption.options.length > 0 ? (
          column && (
            <DataTableAdvancedFacetedFilter
              key={String(selectedOption.value)}
              column={column}
              title={selectedOption.label}
              options={selectedOption.options}
              selectedValues={selectedValues}
              setSelectedOptions={setSelectedOptions}
            />
          )
        ) : (
          <Input
            placeholder="Type here..."
            className="h-8"
            value={column?.getFilterValue() as string}
            onChange={(event) => {
              setValue(event.target.value)
              column?.setFilterValue(event.target.value)
            }}
            autoFocus
          />
        )}
      </PopoverContent>
    </Popover>
  )
}
