import { useEffect } from "react"
import { ChevronLeftIcon } from "@radix-ui/react-icons"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LoaderIcon } from "@/components/loader-icon"
import { editView } from "@/app/_lib/actions"

import type { ViewItem } from "./data-table-views-dropdown"
import { DeleteViewForm } from "./delete-view-form"

interface EditViewFormProps {
  view: ViewItem
  setIsEditViewFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function EditViewForm({
  view,
  setIsEditViewFormOpen,
}: EditViewFormProps) {
  const [state, formAction] = useFormState(editView, {
    message: "",
  })

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message)
    } else if (state.status === "error") {
      toast.error(state.message)
    }
  }, [state])

  return (
    <div>
      <div className="flex items-center gap-1 px-1 py-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          onClick={() => setIsEditViewFormOpen(false)}
        >
          <span className="sr-only">Close edit view form</span>
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
        </Button>
        <span className="text-sm">Edit view</span>
      </div>

      <Separator />

      <form action={formAction} className="flex flex-col gap-2 p-2">
        <input type="hidden" name="id" value={view.id} />
        <Input
          type="text"
          name="name"
          placeholder="Name"
          defaultValue={view.name}
        />
        <SubmitButton />
      </form>

      <Separator />

      <DeleteViewForm
        viewId={view.id}
        setIsEditViewFormOpen={setIsEditViewFormOpen}
      />
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
        "Save"
      )}
    </Button>
  )
}
