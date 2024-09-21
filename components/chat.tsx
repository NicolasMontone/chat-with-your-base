'use client'

import { Message, useChat } from 'ai/react'
import { useAppState } from '@/hooks/use-app-state'
import { useRef, useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Form } from './form'
import TextSkeleton from './text-skeleton'
import Markdown from 'react-markdown'
import CodeBlock from './code-block'
import type { QueryResult } from 'pg'

const toolCallToNameText = {
  getExplainForQuery: 'Getting query plan...',
  getForeignKeyConstraints: 'Fetching foreign key relationships...',
  getIndexes: 'Listing table indexes...',
  getIndexStatsUsage: 'Analyzing index usage...',
  getPublicTablesWithColumns: 'Retrieving public tables and columns...',
  getTableStats: 'Collecting table statistics...',
}

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

  const toolsLoading = useMemo(() => {
    const toolInvocation = messages[messages.length - 1]?.toolInvocations

    return (toolInvocation ?? []).filter((tool) => tool.state === 'call')
  }, [isLoading, messages])

  // New state to manage SQL results
  const [sqlResults, setSqlResults] = useState<{
    [key: string]: QueryResult<unknown[]> | string
  }>({})

  const handleSetSqlResult = useCallback(
    (messageId: string, result: QueryResult<unknown[]> | string) => {
      setSqlResults((prev) => ({
        ...prev,
        [messageId]: result,
      }))
    },
    []
  )

  return (
    <div
      ref={messagesChat}
      className="h-screen overflow-auto sm:min-w-[70%] sm:w-[1000px] sm:max-w-[840px] relative sm:p-28 sm:pt-0 p-12 pt-0 min-w-[90%]"
    >
      {messages?.map((m: Message) => {
        if (m.toolInvocations) return null

        return (
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
                    code: ({ className, children }) => {
                      const language = className?.includes('sql')
                        ? 'sql'
                        : 'markup'
                      return (
                        <CodeBlock
                          // when Is generating text don't run sql
                          isDisabled={isLoading}
                          language={language}
                          sqlResult={sqlResults[m.id]}
                          setSqlResult={(result) =>
                            handleSetSqlResult(m.id, result)
                          }
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
        )
      })}
      {(showSkeleton || toolsLoading.length > 0) && <TextSkeleton />}
      {toolsLoading.map((tool) => {
        const aiRunningText =
          toolCallToNameText[
            tool.toolName as keyof typeof toolCallToNameText
          ] ?? ''

        return (
          aiRunningText && (
            <motion.div
              key={tool.toolCallId}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-primary font-semibold mt-2"
            >
              <p>{aiRunningText}</p>
            </motion.div>
          )
        )
      })}
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
