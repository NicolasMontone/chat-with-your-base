'use client'

import { Message, useChat } from 'ai/react'
import { useLocalStorage } from 'usehooks-ts'
import { useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Form } from './form'
import TextSkeleton from './text-skeleton'
import Markdown from 'react-markdown'
import CodeBlock from './code-block'

export default function Chat() {
  const messagesChat = useRef<HTMLDivElement | null>(null)

  const scrollMessagesToBottom = useCallback(() => {
    if (!messagesChat.current) return

    messagesChat.current.scrollTop = messagesChat.current.scrollHeight
  }, [])

  const [localStorageValue] = useLocalStorage('postgres-key', {
    connectionString: '',
  })

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      keepLastMessageOnError: true,
      headers: {
        'x-connection-string': localStorageValue.connectionString,
      },
      onFinish: scrollMessagesToBottom,
    })

  const showSkeleton = useMemo(() => {
    const lastMessageIsUser = messages[messages.length - 1]?.role === 'user'
    return isLoading && lastMessageIsUser
  }, [isLoading, messages])

  return (
    <div
      ref={messagesChat}
      className="h-screen overflow-auto sm:min-w-[70%] sm:w-[1000px] sm:max-w-[840px] relative sm:p-24 sm:pt-0 p-12 pt-0 min-w-[90%]"
    >
      {messages?.map((m: Message) => (
        <div key={m.id}>
          {m.role === 'user' ? (
            <div className="text-3xl text-primary font-semibold">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {m.content}
              </motion.span>
            </div>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.75 }}
              className="mb-2 text-primary"
            >
              <Markdown
                components={{
                  code: ({ children }) => <CodeBlock>{children}</CodeBlock>,
                }}
              >
                {m.content}
              </Markdown>
            </motion.span>
          )}

          <br />

          {m.role === 'assistant' && !m.toolInvocations && (
            <hr className="my-4" />
          )}
        </div>
      ))}
      {showSkeleton && <TextSkeleton />}

      <Form
        onChange={handleInputChange}
        value={input}
        onSubmit={(e) => {
          handleSubmit(e)
          scrollMessagesToBottom()
        }}
      />
    </div>
  )
}
