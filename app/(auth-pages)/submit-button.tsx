'use client'

import { useFormStatus } from 'react-dom'

import { Button, ButtonProps } from '../../components/ui/button'

type Props = ButtonProps & {
  pendingText?: string
}

export function SubmitButton({ children, pendingText, ...props }: Props) {
  const { pending } = useFormStatus()

  const isPending = pending

  return (
    <Button {...props} type="submit" aria-disabled={pending}>
      {isPending ? pendingText : children}
    </Button>
  )
}
