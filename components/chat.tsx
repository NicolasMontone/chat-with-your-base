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
}: {
  initialId?: string
  initialMessages?: Message[]
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
    estimateSize: () => 100,
    overscan: 5
  })

  // Optimize scroll behavior with RAF
  const scrollMessagesToBottom = useCallback(() => {
    if (!messagesChat.current) return
    
    requestAnimationFrame(() => {
      messagesChat.current?.scrollTo({
        top: messagesChat.current.scrollHeight,
        behavior: 'smooth'
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

  // Memoize expensive computations
  const showSkeleton = useMemo(() => {
    if (!messages.length) return false
    const lastMessageIsUser = messages[messages.length - 1]?.role === 'user'
    return isLoading && lastMessageIsUser
  }, [isLoading, messages])

  // Batch message updates
  const [batchedMessages, setBatchedMessages] = useState<Message[]>([])
  useEffect(() => {
    const timer = setTimeout(() => {
      setBatchedMessages(messages)
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

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
    <div ref={messagesChat} className="h-full overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          const message = messages[virtualRow.index]
          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {message.role === 'user' ? (
                <div className="text-xl text-primary font-semibold">
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {message.content}
                  </motion.span>
                </div>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.75 }}
                  className="mb-2 text-primary"
                >
                  {message.parts ? (
                    message.parts.map((part, index) => {
                      if (part.type === 'tool-invocation') {
                        return null // Skip tool invocations
                      }

                      const content = 'text' in part ? part.text : part.reasoning

                      return (
                        <Markdown
                          key={`${message.id}-part-${index}`}
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code: ({ className, children }) => {
                              const language = className?.includes('sql')
                                ? 'sql'
                                : 'markup'
                              return (
                                <CodeBlock
                                  connectionString={value.connectionString}
                                  isDisabled={isLoading}
                                  language={language}
                                  sqlResult={
                                    sqlResults[`${children?.toString()}_${message.id}`]
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
                              <ul className="list-disc pl-4 my-1">{children}</ul>
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
                            tr: ({ children }) => <TableRow>{children}</TableRow>,
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
                          const language = className?.includes('sql')
                            ? 'sql'
                            : 'markup'
                          return (
                            <CodeBlock
                              connectionString={value.connectionString}
                              isDisabled={isLoading}
                              language={language}
                              sqlResult={
                                sqlResults[`${children?.toString()}_${message.id}`]
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
                          <ul className="list-disc pl-4 my-1">{children}</ul>
                        ),
                        h1: ({ children }) => (
                          <h1 className="text-2xl font-bold my-2">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-xl font-semibold my-1">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-lg font-medium my-1">{children}</h3>
                        ),
                        h4: ({ children }) => (
                          <h4 className="text-base font-normal my-1">
                            {children}
                          </h4>
                        ),
                        h5: ({ children }) => (
                          <h5 className="text-sm font-normal my-1">{children}</h5>
                        ),
                        h6: ({ children }) => (
                          <h6 className="text-xs font-normal my-1">{children}</h6>
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
                        tr: ({ children }) => <TableRow>{children}</TableRow>,
                        th: ({ children }) => <TableHead>{children}</TableHead>,
                        td: ({ children }) => <TableCell>{children}</TableCell>,
                      }}
                    >
                      {message.content}
                    </Markdown>
                  )}
                </motion.span>
              )}
              <br />
              {message.role === 'assistant' && !message.toolInvocations && (
                <hr className="my-4" />
              )}
            </div>
          )
        })}
      </div>
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
                repeat: Number.POSITIVE_INFINITY,
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
