'use client'

import { useState, useEffect, useRef } from 'react'
import { changeName } from '@/actions/chat-name'
import { Button } from '@/components/ui/button'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export function ChatName({
  initialName,
  id,
}: {
  initialName: string
  id: string
}) {
  const { toast } = useToast()
  const [name, setName] = useState(initialName)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isEditingName, setIsEditingName] = useState(false)

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditingName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsEditingName(false)

      const formData = new FormData()

      formData.append('id', id)
      formData.append('name', name)

      const response = await changeName(formData)
      if (response.error) {
        toast({
          title: 'Failed to change name',
          description: response.error,
          variant: 'destructive',
        })
        return
      }

      if (response.success) {
        toast({
          title: 'Name changed successfully',
          description: 'Your audio name has been updated',
        })
      }
      setIsEditingName(false)
    } catch (error) {
      toast({
        title: 'Failed to change name',
        description: 'Please try again',
        variant: 'destructive',
      })
    }
  }

  if (isEditingName) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-2 py-1 text-sm h-8"
          spellCheck={false}
          style={{ minWidth: '200px' }}
        />
        {/* hidden input for Enter upload */}
        <input type="submit" className="hidden" />
        <Button type="submit" size="tiny" variant="ghost">
          Save
        </Button>
        <Button
          type="button"
          size="tiny"
          variant="ghost"
          onClick={() => {
            setIsEditingName(false)
            setName(initialName)
          }}
        >
          Cancel
        </Button>
      </form>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsEditingName(true)}
            className="text-left transition-opacity"
            size="tiny"
          >
            <div className="text-sm truncate vt-name-[name]">{name}</div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit name</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
