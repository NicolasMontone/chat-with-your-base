'use client'

import { Check, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { runSql } from '@/actions/run-sql'
import { toast } from '@/hooks/use-toast'

import { useAppState } from '../hooks/use-app-state'
import type { QueryResult } from 'pg'
import SqlResult from './sql-result'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import 'prismjs/themes/prism-okaidia.css'

function CodeBlock({
  children,
  language,
  sqlResult,
  setSqlResult,
  isDisabled,
}: {
  children: React.ReactNode
  language?: string
  sqlResult?: QueryResult<unknown[]> | string
  setSqlResult: (result: QueryResult<unknown[]> | string) => void
  isDisabled?: boolean
}) {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  const { value } = useAppState()

  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      navigator.clipboard.writeText(children as string)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to copy to clipboard', error)
    }
  }

  const [isLoading, setIsLoading] = useState(false)

  const run = async () => {
    console.log('run')
    if (!children?.toString()) {
      toast({
        title: 'No SQL query provided',
        description: 'Please provide a valid SQL query',
      })
      return
    }
    setIsLoading(true)

    const sqlFunctionBinded = runSql.bind(
      null,
      children?.toString(),
      value.connectionString
    )
    const result = await sqlFunctionBinded()
    try {
      const parsedResult = JSON.parse(result)
      setSqlResult && setSqlResult(parsedResult)
    } catch {
      setSqlResult && setSqlResult(result)
    }

    setIsLoading(false)
  }

  if (
    language !== 'sql' &&
    typeof children === 'string' &&
    children.length < 40
  ) {
    return (
      <span className="bg-[#121211] text-[#f8f8f2] inline-block p-1 rounded-sm font-mono">
        {children}
      </span>
    )
  }

  return (
    <div className="flex flex-col my-3 gap-2">
      <div className="relative">
        <div className="absolute right-2 top-4">
          <div className="w-4 h-4">
            {copied ? (
              <Check size={15} className="text-green-500" />
            ) : (
              <Copy
                size={15}
                onClick={copyToClipboard}
                className="cursor-pointer text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              />
            )}
          </div>
        </div>
        <pre className="!bg-prima !text-[#f8f8f2] w-full !p-5 !pt-8 text-sm rounded-md overflow-auto">
          <code className={`language-${language ?? 'markup'}`}>{children}</code>
        </pre>
      </div>
      {isLoading ? (
        <div className="w-full h-32 bg-primary opacity-20 rounded-md animate-pulse" />
      ) : sqlResult ? (
        <SqlResult result={sqlResult} />
      ) : null}

      {language === 'sql' && (
        <Button
          disabled={isDisabled}
          aria-disabled={isDisabled}
          size={'sm'}
          variant={'outline'}
          onClick={run}
        >
          Run SQL
        </Button>
      )}
    </div>
  )
}

export default CodeBlock
