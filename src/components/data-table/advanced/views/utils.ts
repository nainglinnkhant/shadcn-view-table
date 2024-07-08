import { ReadonlyURLSearchParams } from "next/navigation"
import type { DataTableFilterOption } from "@/types"

import { createQueryString, type Params } from "@/lib/utils"
import type {
  Filter,
  FilterParams,
  Operator,
  SearchParams,
  Sort,
} from "@/app/_lib/validations"

import type { ViewItem } from "./data-table-views-dropdown"

export const FILTERABLE_FIELDS: (keyof SearchParams)[] = [
  "title",
  "status",
  "priority",
  "sort",
  "operator",
]

export const COLUMNS = ["title", "status", "priority", "createdAt"] as const

export function calcFilterParams<T = unknown>(
  selectedOptions: DataTableFilterOption<T>[],
  searchParams: ReadonlyURLSearchParams
) {
  const filterItems: Filter[] = selectedOptions
    .filter((option) => option.filterValues && option.filterValues.length > 0)
    .map((option) => ({
      field: option.value as Filter["field"],
      value: `${option.filterValues?.join("~")}~${option.filterOperator}`,
      isMulti: !!option.isMulti,
    }))
  const filterParams: FilterParams = {
    filters: filterItems,
  }
  if (searchParams.get("operator")) {
    filterParams.operator = searchParams.get("operator") as Operator
  }
  if (searchParams.get("sort")) {
    filterParams.sort = searchParams.get("sort") as Sort
  }
  return filterParams
}

export function calcViewSearchParamsURL(view: ViewItem) {
  const searchParamsObj: Params = {}
  const filterParams = view.filterParams
  if (!filterParams) return

  for (const item of filterParams.filters ?? []) {
    if (FILTERABLE_FIELDS.includes(item.field)) {
      searchParamsObj[item.field] = item.value
    }
  }
  if (filterParams.operator) {
    searchParamsObj.operator = filterParams.operator
  }
  if (filterParams.sort) {
    searchParamsObj.sort = filterParams.sort
  }
  searchParamsObj.page = 1
  searchParamsObj.per_page = 10
  searchParamsObj.viewId = view.id

  return createQueryString(searchParamsObj, new ReadonlyURLSearchParams())
}

export function getIsFiltered(searchParams: ReadonlyURLSearchParams) {
  const filters = []
  const filterObj = Object.fromEntries(searchParams)
  for (const [key, value] of Object.entries(filterObj) as [
    keyof SearchParams,
    string,
  ][]) {
    if (key === "sort" && value === "createdAt.desc") {
      continue
    }

    if (FILTERABLE_FIELDS.includes(key)) {
      filters.push(key)
    }
  }
  return filters.length > 0
}
