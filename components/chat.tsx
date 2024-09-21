'use client'

import { Message, useChat } from 'ai/react'
import { useAppState } from '@/hooks/use-app-state'
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

  const { value } = useAppState()

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      keepLastMessageOnError: true,
      headers: {
        'x-connection-string': value.connectionString,
        'x-openai-api-key': value.openaiApiKey,
        'x-model': value.model,
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
      className="h-screen overflow-auto sm:min-w-[70%] sm:w-[1000px] sm:max-w-[840px] relative sm:p-28 sm:pt-0 p-12 pt-0 min-w-[90%]"
    >
      {messages?.map((m: Message) => (
        <div key={m.id}>
          {m.role === 'user' ? (
            <div className="text-2xl text-primary font-semibold">
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
                  code: ({ children, className }) => {
                    return (
                      <CodeBlock
                        language={className?.includes('sql') ? 'sql' : 'markup'}
                      >
                        {children}
                      </CodeBlock>
                    )
                  },
                  li: ({ children }) => <li className="my-1">{children}</li>,
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 my-1">{children}</ul>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold my-2">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold my-1">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium my-1">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-normal my-1">{children}</h4>
                  ),
                  h5: ({ children }) => (
                    <h5 className="text-sm font-normal my-1">{children}</h5>
                  ),
                  h6: ({ children }) => (
                    <h6 className="text-xs font-normal my-1">{children}</h6>
                  ),
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
