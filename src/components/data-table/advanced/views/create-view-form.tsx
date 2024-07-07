import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ChevronLeftIcon } from "@radix-ui/react-icons"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LoaderIcon } from "@/components/loader-icon"
import { useTableInstanceContext } from "@/app/_components/table-instance-provider"
import { createView } from "@/app/_lib/actions"
import type { FilterParams } from "@/app/_lib/validations"

import { calcViewSearchParamsURL } from "./utils"

interface CreateViewFormProps {
  backButton?: true
  onBack?: () => void
  onSuccess?: () => void
  filterParams?: FilterParams
}

export function CreateViewForm({
  backButton,
  filterParams,
  onBack,
  onSuccess,
}: CreateViewFormProps) {
  const router = useRouter()
  const pathname = usePathname()

  const nameInputRef = useRef<HTMLInputElement>(null)

  const { tableInstance } = useTableInstanceContext()

  const [state, formAction] = useFormState(createView, {
    message: "",
  })

  const visibleColumns = tableInstance
    .getVisibleFlatColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide()
    )
    .map((column) => column.id)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (state.status === "success") {
      onSuccess?.()
      if (state.view) {
        const searchParamsURL = calcViewSearchParamsURL(state.view)
        router.replace(`${pathname}?${searchParamsURL}`)
      }
      toast.success(state.message)
    } else if (state.status === "error") {
      toast.error(state.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  return (
    <div>
      {backButton && (
        <>
          <div className="flex items-center gap-1 px-1 py-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={() => onBack?.()}
            >
              <span className="sr-only">Close create view form</span>
              <ChevronLeftIcon aria-hidden="true" className="size-4" />
            </Button>

            <span className="text-sm">Create view</span>
          </div>

          <Separator />
        </>
      )}

      <form action={formAction} className="flex flex-col gap-2 p-2">
        <input
          type="hidden"
          name="columns"
          value={JSON.stringify(visibleColumns)}
        />
        <input
          type="hidden"
          name="filterParams"
          value={JSON.stringify(filterParams)}
        />
        <Input
          ref={nameInputRef}
          type="text"
          name="name"
          placeholder="Name"
          autoComplete="off"
        />
        <SubmitButton />
      </form>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button disabled={pending} size="sm">
      {pending ? (
        <LoaderIcon aria-hidden="true" className="size-3.5 animate-spin" />
      ) : (
        "Create"
      )}
    </Button>
  )
}
