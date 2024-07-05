import { useEffect } from "react"
import { ChevronLeftIcon } from "@radix-ui/react-icons"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { LoaderIcon } from "@/components/loader-icon"
import { createView } from "@/app/_lib/actions"

interface CreateViewFormProps {
  setIsCreateViewFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function CreateViewForm({
  setIsCreateViewFormOpen,
}: CreateViewFormProps) {
  const [state, formAction] = useFormState(createView, {
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
          onClick={() => setIsCreateViewFormOpen(false)}
        >
          <span className="sr-only">Close create view form</span>
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
        </Button>
        <span className="text-sm">Create view</span>
      </div>

      <Separator />

      <form action={formAction} className="flex flex-col gap-2 p-2">
        <Input type="text" name="name" placeholder="Name" autoComplete="off" />
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
