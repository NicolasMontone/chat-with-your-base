'use client'

import { Message, useChat } from '@ai-sdk/react'
import { useAppState } from '@/hooks/use-app-state'
import { useRef, useCallback, useMemo, useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Form } from './form'
import TextSkeleton from './text-skeleton'
import Markdown from 'react-markdown'
import CodeBlock from './code-block'
import type { QueryResult } from 'pg'
import remarkGfm from 'remark-gfm'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '../hooks/use-toast'
import { v4 } from 'uuid'
import { useVirtualizer, type VirtualItem } from '@tanstack/react-virtual'
import Navbar from './navbar'
import { User } from '@supabase/supabase-js'

const toolCallToNameText = {
  getExplainForQuery: 'Getting query plan...',
  getForeignKeyConstraints: 'Fetching foreign key relationships...',
  getIndexes: 'Listing table indexes...',
  getIndexStatsUsage: 'Analyzing index usage...',
  getPublicTablesWithColumns: 'Retrieving public tables and columns...',
  getTableStats: 'Collecting table statistics...',
}

export default function Chat({
  initialId,
  initialMessages,
  user,
}: {
  initialId?: string
  initialMessages?: Message[]
  user: User
}) {
  const { toast } = useToast()
  const messagesChat = useRef<HTMLDivElement | null>(null)
  const { value } = useAppState()
  const [id, setId] = useState(initialId)
  const [isNewChat, setIsNewChat] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: '/api/chat',
      headers: {
        'x-connection-string': value.connectionString,
        'x-openai-api-key': value.openaiApiKey,
      },
      onFinish: () => {
        scrollMessagesToBottom()
      },
      onResponse: async () => {
        if (typeof window !== 'undefined') {
          if (isNewChat) {
            setIsNewChat(false)
            try {
              window.history.pushState({}, '', `/app/${id}`)
            } catch (error) {
              console.error('Error pushing state:', error)
            }
          }
        }
      },
      streamProtocol: 'data',
      sendExtraMessageFields: true,
      id,
      initialMessages,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        })
      },
    })

  // Add virtualization
  const rowVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => messagesChat.current,
    estimateSize: (index) => {
      const message = messages[index]
      // If the message contains SQL results with a chart, allocate more space
      if (message.id in sqlResults) {
        return 800 // Increased height for messages with charts
      }
      return 100 // Default height for regular messages
    },
    overscan: 5,
  })

  // Optimize scroll behavior with RAF
  const scrollMessagesToBottom = useCallback(() => {
    if (!messagesChat.current) return

    requestAnimationFrame(() => {
      messagesChat.current?.scrollTo({
        top: messagesChat.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }, [])

  useEffect(() => {
    if (!initialId) {
      const id = v4()

      setId(id)
      setIsNewChat(true)
    }
  }, [initialId])

  // Cleanup SQL results when component unmounts
  useEffect(() => {
    return () => {
      setSqlResults({})
    }
  }, [])

  const showSkeleton = useMemo(() => {
    if (!messages.length) return false
    const lastMessageIsUser = messages[messages.length - 1]?.role === 'user'
    return isLoading && lastMessageIsUser
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

  const toolsLoading = useMemo(() => {
    const toolInvocation = messages[messages.length - 1]?.toolInvocations

    return (toolInvocation ?? []).filter((tool) => tool.state === 'call')
  }, [messages])

  return (
    <div className="flex-1 flex flex-col w-full">
      <Navbar user={user} />

      <div ref={messagesChat} className="flex-1 overflow-y-auto w-full">
        <div className="container mx-auto max-w-4xl h-full">
          <div className="px-4 py-6">
            <div className="w-full space-y-12">
              {rowVirtualizer
                .getVirtualItems()
                .map((virtualRow: VirtualItem) => {
                  const message = messages[virtualRow.index]
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      {message.role === 'user' ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          className="text-2xl font-bold text-primary mb-6 border-b pb-2"
                        >
                          {message.content}
                        </motion.div>
                      ) : (
                        <>
                          {message.parts && message.parts.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.4 }}
                              className="text-base prose prose-neutral dark:prose-invert max-w-none"
                            >
                              {message.parts ? (
                                message.parts.map((part, index) => {
                                  if (part.type === 'tool-invocation') {
                                    return null
                                  }

                                  const content =
                                    'text' in part ? part.text : part.reasoning

                                  return (
                                    <Markdown
                                      key={`${message.id}-part-${index}`}
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        code: ({ className, children }) => {
                                          const language = className?.includes(
                                            'sql'
                                          )
                                            ? 'sql'
                                            : 'markup'
                                          return (
                                            <CodeBlock
                                              connectionString={
                                                value.connectionString
                                              }
                                              isDisabled={isLoading}
                                              language={language}
                                              sqlResult={
                                                sqlResults[
                                                  `${children?.toString()}_${message.id}`
                                                ]
                                              }
                                              setSqlResult={(result) =>
                                                handleSetSqlResult(
                                                  `${children?.toString()}_${message.id}`,
                                                  result
                                                )
                                              }
                                            >
                                              {children}
                                            </CodeBlock>
                                          )
                                        },
                                        li: ({ children }) => (
                                          <li className="my-1">{children}</li>
                                        ),
                                        ul: ({ children }) => (
                                          <ul className="list-disc pl-4 my-1">
                                            {children}
                                          </ul>
                                        ),
                                        h1: ({ children }) => (
                                          <h1 className="text-2xl font-bold my-2">
                                            {children}
                                          </h1>
                                        ),
                                        h2: ({ children }) => (
                                          <h2 className="text-xl font-semibold my-1">
                                            {children}
                                          </h2>
                                        ),
                                        h3: ({ children }) => (
                                          <h3 className="text-lg font-medium my-1">
                                            {children}
                                          </h3>
                                        ),
                                        h4: ({ children }) => (
                                          <h4 className="text-base font-normal my-1">
                                            {children}
                                          </h4>
                                        ),
                                        h5: ({ children }) => (
                                          <h5 className="text-sm font-normal my-1">
                                            {children}
                                          </h5>
                                        ),
                                        h6: ({ children }) => (
                                          <h6 className="text-xs font-normal my-1">
                                            {children}
                                          </h6>
                                        ),
                                        table: ({ children }) => (
                                          <div className="my-3">
                                            <Table>{children}</Table>
                                          </div>
                                        ),
                                        thead: ({ children }) => (
                                          <TableHeader>{children}</TableHeader>
                                        ),
                                        tbody: ({ children }) => (
                                          <TableBody>{children}</TableBody>
                                        ),
                                        tr: ({ children }) => (
                                          <TableRow>{children}</TableRow>
                                        ),
                                        th: ({ children }) => (
                                          <TableHead>{children}</TableHead>
                                        ),
                                        td: ({ children }) => (
                                          <TableCell>{children}</TableCell>
                                        ),
                                      }}
                                    >
                                      {content}
                                    </Markdown>
                                  )
                                })
                              ) : (
                                <Markdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    code: ({ className, children }) => {
                                      const language = className?.includes(
                                        'sql'
                                      )
                                        ? 'sql'
                                        : 'markup'
                                      return (
                                        <CodeBlock
                                          connectionString={
                                            value.connectionString
                                          }
                                          isDisabled={isLoading}
                                          language={language}
                                          sqlResult={
                                            sqlResults[
                                              `${children?.toString()}_${message.id}`
                                            ]
                                          }
                                          setSqlResult={(result) =>
                                            handleSetSqlResult(
                                              `${children?.toString()}_${message.id}`,
                                              result
                                            )
                                          }
                                        >
                                          {children}
                                        </CodeBlock>
                                      )
                                    },
                                    li: ({ children }) => (
                                      <li className="my-1">{children}</li>
                                    ),
                                    ul: ({ children }) => (
                                      <ul className="list-disc pl-4 my-1">
                                        {children}
                                      </ul>
                                    ),
                                    h1: ({ children }) => (
                                      <h1 className="text-2xl font-bold my-2">
                                        {children}
                                      </h1>
                                    ),
                                    h2: ({ children }) => (
                                      <h2 className="text-xl font-semibold my-1">
                                        {children}
                                      </h2>
                                    ),
                                    h3: ({ children }) => (
                                      <h3 className="text-lg font-medium my-1">
                                        {children}
                                      </h3>
                                    ),
                                    h4: ({ children }) => (
                                      <h4 className="text-base font-normal my-1">
                                        {children}
                                      </h4>
                                    ),
                                    h5: ({ children }) => (
                                      <h5 className="text-sm font-normal my-1">
                                        {children}
                                      </h5>
                                    ),
                                    h6: ({ children }) => (
                                      <h6 className="text-xs font-normal my-1">
                                        {children}
                                      </h6>
                                    ),
                                    table: ({ children }) => (
                                      <div className="my-3">
                                        <Table>{children}</Table>
                                      </div>
                                    ),
                                    thead: ({ children }) => (
                                      <TableHeader>{children}</TableHeader>
                                    ),
                                    tbody: ({ children }) => (
                                      <TableBody>{children}</TableBody>
                                    ),
                                    tr: ({ children }) => (
                                      <TableRow>{children}</TableRow>
                                    ),
                                    th: ({ children }) => (
                                      <TableHead>{children}</TableHead>
                                    ),
                                    td: ({ children }) => (
                                      <TableCell>{children}</TableCell>
                                    ),
                                  }}
                                >
                                  {message.content}
                                </Markdown>
                              )}
                            </motion.div>
                          )}
                          {(showSkeleton || toolsLoading.length > 0) &&
                            virtualRow.index === messages.length - 1 && (
                              <div className="mt-6">
                                <TextSkeleton />
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
                                          repeat: Number.POSITIVE_INFINITY,
                                          ease: 'easeInOut',
                                        }}
                                        className="text-primary/70 font-medium mt-2"
                                      >
                                        <p>{aiRunningText}</p>
                                      </motion.div>
                                    )
                                  )
                                })}
                              </div>
                            )}
                        </>
                      )}
                    </motion.div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none border-t bg-background/95">
        <div className="container max-w-4xl mx-auto p-4">
          <Form
            onChange={handleInputChange}
            value={input}
            onSubmit={(e) => {
              handleSubmit(e)
              scrollMessagesToBottom()
            }}
          />
        </div>
      </div>
    </div>
  )
}
