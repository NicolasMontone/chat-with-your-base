'use client'

import { Message, useChat } from 'ai/react'

// import { validateDbConnection } from '@/actions/validate-db-connection'
import { useLocalStorage } from 'usehooks-ts'
import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Form } from './form'

export default function Chat() {
  const messagesChat = useRef<HTMLDivElement | null>(null)

  const scrollMessagesToBottom = useCallback(() => {
    if (!messagesChat.current) return

    messagesChat.current.scrollTop = messagesChat.current.scrollHeight
  }, [])

  const [localStorageValue] = useLocalStorage('postgres-key', {
    connectionString: '',
  })

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    keepLastMessageOnError: true,
    headers: {
      'x-connection-string': localStorageValue.connectionString,
    },
    onFinish: () => {
      scrollMessagesToBottom()
    },
  })

  return (
    <div
      ref={messagesChat}
      className="h-screen overflow-auto sm:min-w-[70%] sm:w-[1000px] sm:max-w-[840px] relative sm:p-24 p-12 min-w-[90%] pt-20"
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
              {m.content}
            </motion.span>
          )}

          <br />
          <br />
          {m.role === 'assistant' && !m.toolInvocations && (
            <hr className="my-4" />
          )}
        </div>
      ))}

      <Form
        onChange={handleInputChange}
        value={input}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
