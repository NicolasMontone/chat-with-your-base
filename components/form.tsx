'use client'

import React, { useCallback, useRef, useState } from 'react'

import { FlipWords } from './flipping-words'
import { motion } from 'motion/react'
import { useWindowSize } from 'usehooks-ts'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export function Form({ onChange, onSubmit, value }: Props) {
  const { height } = useWindowSize()

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
    // TOOD: remove any
    submit(e as any)
    handleResize()
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{
        top: '50%',
      }}
      animate={{
        top: conversationStarted && height ? `${height - 80}px` : '50%',
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
      className="fixed left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full w-[1000px] transition-all duration-1000 ease-in-out flex justify-center items-center"
    >
      <motion.div
        initial={{
          width: '60%',
        }}
        animate={{
          width: conversationStarted ? '70%' : '60%',
        }}
        transition={{
          duration: 1,
          ease: 'easeInOut',
        }}
        className="relative min-w-72"
      >
        {value || conversationStarted ? null : (
          <div className="absolute left-2 top-[12px] pointer-events-none placeholder-opacity-0	">
            <FlipWords words={searchs} />
          </div>
        )}

        <motion.div
          initial={{
            opacity: 0,
            scale: 1,
          }}
          animate={{
            opacity: focused ? 1 : 0,
            scale: focused ? 1 : 0.4,
          }}
          transition={{
            duration: 0.41,
            ease: 'easeInOut',
          }}
          className="absolute top-2 blur-md bg-primary w-full h-16 animate-pulse pointer-events-none -z-10 transition-all duration-500 ease-out rounded-sm"
          ref={animationRef}
          style={{ animationDuration: '3s' }} // Add this line to slow down the pulse animation
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
          onResize={handleResize}
          placeholder={
            conversationStarted ? 'Ask anything about your DB...' : ''
          }
          value={value}
          className="resize-none w-full p-3 rounded-sm"
        />
      </motion.div>
    </motion.form>
  )
}
