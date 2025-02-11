'use client'

import React, { useCallback, useRef, useState } from 'react'

import { FlipWords } from './flipping-words'
import { motion } from 'motion/react'

import { Textarea } from '@/components/ui/textarea'

type Props = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function Form({ onChange, onSubmit, value }: Props) {
  const [focused, setFocused] = useState(false)
  const [conversationStarted, setConversationStarted] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const submit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!value) return

      if (!conversationStarted) {
        setConversationStarted(true)
      }
      onSubmit(e)
      inputRef.current?.focus()
    },
    [value, conversationStarted, onSubmit]
  )

  const animationRef = useRef<HTMLDivElement | null>(null)

  const searchs = [
    'How can optimize this query?',
    'What are my DB stats?',
    'What indexes is my database ignoring?',
    'How can I get all users that signed up in the last 30 days?',
  ]

  const handleResize = useCallback(() => {
    if (animationRef.current && inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 124)}px`

      if (
        Math.abs(
          animationRef.current.offsetHeight - inputRef.current.offsetHeight
        ) > 10
      ) {
        animationRef.current.style.height = `${inputRef.current.offsetHeight - 10}px`
      }
    }
  }, [animationRef, inputRef])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit(e as any)
    handleResize()
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto relative">
      <div className="relative">
        {value || conversationStarted ? null : (
          <div className="absolute left-4  top-4 pointer-events-none text-muted-foreground">
            <FlipWords words={searchs} />
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{
            opacity: focused ? 1 : 0,
            scale: focused ? 1 : 0.98,
          }}
          transition={{
            duration: 0.2,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 blur-md bg-primary/5 rounded-lg pointer-events-none"
          ref={animationRef}
        />

        <Textarea
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          ref={inputRef}
          onChange={(e) => {
            onChange(e)
            handleResize()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
          placeholder={
            conversationStarted ? 'Ask anything about your DB...' : ''
          }
          value={value}
          className="resize-none w-full p-4 rounded-lg min-h-[56px] bg-background border focus:ring-2 focus:ring-primary/20 transition-all duration-200"
        />
      </div>
    </form>
  )
}
