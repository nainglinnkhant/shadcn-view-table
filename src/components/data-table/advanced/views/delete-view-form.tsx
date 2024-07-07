import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useFormState, useFormStatus } from "react-dom"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { LoaderIcon } from "@/components/loader-icon"
import { deleteView } from "@/app/_lib/actions"

interface DeleteViewFormProps {
  viewId: string
  setIsEditViewFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export function DeleteViewForm({
  viewId,
  setIsEditViewFormOpen,
}: DeleteViewFormProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [state, formAction] = useFormState(deleteView, {
    message: "",
  })

  useEffect(() => {
    if (state.status === "success") {
      setIsEditViewFormOpen(false)
      if (searchParams.get("viewId") === viewId) {
        router.replace(pathname)
      }
      toast.success(state.message)
    } else if (state.status === "error") {
      toast.error(state.message)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, setIsEditViewFormOpen])

  return (
    <form action={formAction} className="p-2">
      <input type="hidden" name="id" value={viewId} />
      <SubmitButton />
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      disabled={pending}
      variant="outline"
      size="sm"
      className="w-full border-red-800/50 text-red-600 hover:bg-destructive/10 hover:text-red-600 active:bg-destructive/10"
    >
      {pending ? (
        <LoaderIcon aria-hidden="true" className="size-3.5 animate-spin" />
      ) : (
        "Delete"
      )}
    </Button>
  )
}
