import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { DataTableFilterOption } from "@/types"
import {
  CopyIcon,
  DotsHorizontalIcon,
  TextAlignCenterIcon,
  TrashIcon,
} from "@radix-ui/react-icons"
import type { Table } from "@tanstack/react-table"

import { dataTableConfig, type DataTableConfig } from "@/config/data-table"
import { createQueryString } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Separator } from "@/components/ui/separator"

import { DataTableFacetedFilter } from "../data-table-faceted-filter"

interface DataTableMultiFilterProps<TData> {
  table: Table<TData>
  allOptions: DataTableFilterOption<TData>[]
  options: DataTableFilterOption<TData>[]
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  defaultOpen: boolean
}

export function DataTableMultiFilter<TData>({
  table,
  allOptions,
  options,
  setSelectedOptions,
  defaultOpen,
}: DataTableMultiFilterProps<TData>) {
  const searchParams = useSearchParams()

  const currentOperator = dataTableConfig.logicalOperators.find(
    (operator) => searchParams.get("operator") === operator.value
  )

  const [open, setOpen] = React.useState(defaultOpen)
  const [operator, setOperator] = React.useState(
    currentOperator || dataTableConfig.logicalOperators[0]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 truncate rounded-full"
        >
          <TextAlignCenterIcon className="mr-2 size-3" aria-hidden="true" />
          {options.length} rule
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 text-xs" align="start">
        <div className="space-y-2 p-4">
          {options.map((option, i) => (
            <MultiFilterRow
              key={option.id ?? i}
              i={i}
              option={option}
              table={table}
              allOptions={allOptions}
              setSelectedOptions={setSelectedOptions}
              operator={operator}
              setOperator={setOperator}
            />
          ))}
        </div>
        <Separator />
        <div className="p-1">
          <Button
            aria-label="Delete filter"
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setSelectedOptions((prev) => prev.filter((item) => !item.isMulti))

              const tableState = table.getState()
              const multiFilters = tableState.columnFilters.filter((filter) =>
                options.some((option) => option.value === filter.id)
              )
              for (const filter of multiFilters) {
                table.getColumn(filter.id)?.setFilterValue("")
              }
            }}
          >
            Delete filter
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface MultiFilterRowProps<TData> {
  i: number
  table: Table<TData>
  allOptions: DataTableFilterOption<TData>[]
  option: DataTableFilterOption<TData>
  setSelectedOptions: React.Dispatch<
    React.SetStateAction<DataTableFilterOption<TData>[]>
  >
  operator?: DataTableConfig["logicalOperators"][number]
  setOperator: React.Dispatch<
    React.SetStateAction<
      DataTableConfig["logicalOperators"][number] | undefined
    >
  >
}

export function MultiFilterRow<TData>({
  i,
  table,
  option,
  allOptions,
  setSelectedOptions,
  operator,
  setOperator,
}: MultiFilterRowProps<TData>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [value, setValue] = React.useState("")
  const debounceValue = useDebounce(value, 500)

  const column = table.getColumn(option.value ? String(option.value) : "")

  const comparisonOperators =
    option.options.length > 0
      ? dataTableConfig.selectableOperators
      : dataTableConfig.comparisonOperators

  const [comparisonOperator, setComparisonOperator] = React.useState(
    comparisonOperators[0]
  )

  // Update query string
  React.useEffect(() => {
    if (option.options.length > 0) {
      // key=value1.value2.value3~operator
      const filterValues = option.filterValues ?? []
      const newSearchParams = createQueryString(
        {
          [String(option.value)]:
            filterValues.length > 0
              ? `${filterValues.join(".")}~${comparisonOperator?.value}`
              : null,
        },
        searchParams
      )
      router.push(`${pathname}?${newSearchParams}`, {
        scroll: false,
      })
    } else {
      // key=value~operator
      const newSearchParams = createQueryString(
        {
          [String(option.value)]:
            debounceValue.length > 0
              ? `${debounceValue}~${comparisonOperator?.value}`
              : null,
        },
        searchParams
      )
      router.push(`${pathname}?${newSearchParams}`, {
        scroll: false,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceValue, comparisonOperator?.value, option])

  // Update filter variety
  React.useEffect(() => {
    if (option.options.length) {
      setComparisonOperator(dataTableConfig.selectableOperators[0])
    } else {
      setComparisonOperator(dataTableConfig.comparisonOperators[0])
    }
  }, [option.options.length])

  // Update operator query string
  React.useEffect(() => {
    if (operator?.value) {
      router.push(
        `${pathname}?${createQueryString(
          {
            operator: operator.value,
          },
          searchParams
        )}`,
        {
          scroll: false,
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operator?.value])

  // Update table state when search params are changed
  React.useEffect(() => {
    const [value, comparisonOperator] =
      searchParams.get(option.value as string)?.split("~") ?? []
    const logicalOperator = searchParams.get("operator")

    const currentComparisonOperator = comparisonOperators.find(
      (operator) => operator.value === comparisonOperator
    )
    const currentLogicalOperator = dataTableConfig.logicalOperators.find(
      (operator) => operator.value === logicalOperator
    )

    if (option.options.length > 0) {
      const selectedValues = value?.split(".") ?? []

      setSelectedOptions((prev) =>
        prev.map((item) => {
          if (item.value === column?.id) {
            return {
              ...item,
              filterValues: selectedValues,
            }
          }

          return item
        })
      )
    } else {
      setValue(value || "")
    }

    if (!currentComparisonOperator) return
    setComparisonOperator(currentComparisonOperator)

    if (!currentLogicalOperator) return
    setOperator(currentLogicalOperator)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <div className="flex items-center space-x-2">
      {i === 0 ? (
        <div>Where</div>
      ) : i === 1 ? (
        <Select
          value={operator?.value}
          onValueChange={(value) =>
            setOperator(
              dataTableConfig.logicalOperators.find((o) => o.value === value)
            )
          }
        >
          <SelectTrigger className="h-8 w-fit text-xs">
            <SelectValue placeholder={operator?.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {dataTableConfig.logicalOperators.map((operator) => (
                <SelectItem
                  key={operator.value}
                  value={operator.value}
                  className="text-xs"
                >
                  {operator.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <div key={operator?.value}>{operator?.label}</div>
      )}
      <Select
        value={String(option.value)}
        onValueChange={(value) => {
          const chosenOption = allOptions.find(
            (option) => option.value === value
          )
          if (!chosenOption) return

          setSelectedOptions((prev) =>
            prev.map((item) => {
              if (item.id === option.id) {
                return {
                  ...item,
                  value: chosenOption.value,
                  label: chosenOption.label,
                  options: chosenOption.options ?? [],
                }
              }
              return item
            })
          )
        }}
      >
        <SelectTrigger className="h-8 w-full text-xs capitalize">
          <SelectValue placeholder={option.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {allOptions.map((option) => (
              <SelectItem
                key={String(option.value)}
                value={String(option.value)}
                className="text-xs capitalize"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        value={comparisonOperator?.value}
        onValueChange={(value) => {
          const newOperator = comparisonOperators.find(
            (operator) => operator.value === value
          )
          setComparisonOperator(newOperator)
        }}
      >
        <SelectTrigger className="h-8 w-full truncate px-2 py-0.5 hover:bg-muted/50">
          <SelectValue placeholder={comparisonOperators[0]?.label} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {comparisonOperators.map((operator) => (
              <SelectItem key={operator.value} value={operator.value}>
                {operator.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {option.options.length ? (
        <DataTableFacetedFilter
          key={option.id}
          column={column}
          title={option.label}
          options={option.options}
          selectedOption={option}
          setSelectedOptions={setSelectedOptions}
        />
      ) : (
        <Input
          placeholder="Type here..."
          className="h-8"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Open filter menus"
            size="icon"
            className="size-8 shrink-0"
          >
            <DotsHorizontalIcon className="size-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              setSelectedOptions((prev) =>
                prev.filter((item) => item.id !== option.id)
              )
              column?.setFilterValue("")
            }}
          >
            <TrashIcon className="mr-2 size-4" aria-hidden="true" />
            Remove
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              if (!option) return

              setSelectedOptions((prev) => [
                ...prev,
                {
                  id: crypto.randomUUID(),
                  label: option.label,
                  value: option.value,
                  options: option.options ?? [],
                  isMulti: true,
                },
              ])
            }}
          >
            <CopyIcon className="mr-2 size-4" aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
