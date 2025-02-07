'use client'

import { Check, Copy, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { runSql } from '@/actions/run-sql'
import { toast } from '@/hooks/use-toast'
import { DynamicChart } from '@/components/dynamic-chart'
import { generateChartConfig } from '@/actions/chart'
import type { Config, Result } from '@/lib/chart'

import type { QueryResult } from 'pg'
import SqlResult from './sql-result'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import 'prismjs/themes/prism-okaidia.css'

const convertToResult = (rows: unknown[]): Result[] => {
  return rows.map((row) => {
    if (typeof row === 'object' && row !== null) {
      return Object.entries(row).reduce((acc, [key, value]) => {
        acc[key] = value as string | number
        return acc
      }, {} as Result)
    }
    throw new Error('Invalid row data')
  })
}

function CodeBlock({
  children,
  language,
  sqlResult,
  setSqlResult,
  isDisabled,
  connectionString,
}: {
  children: React.ReactNode
  language?: string
  sqlResult?: QueryResult<unknown[]> | string
  setSqlResult: (result: QueryResult<unknown[]> | string) => void
  isDisabled?: boolean
  connectionString: string
}) {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  const [copied, setCopied] = useState(false)
  const [showChart, setShowChart] = useState(false)
  const [chartConfig, setChartConfig] = useState<Config | null>(null)
  const [isChartLoading, setIsChartLoading] = useState(false)

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
      connectionString
    )
    const result = await sqlFunctionBinded()
    try {
      const parsedResult = JSON.parse(result)
      setSqlResult?.(parsedResult)
    } catch {
      setSqlResult?.(result)
    }

    setIsLoading(false)
  }

  const handleShowChart = async () => {
    if (!sqlResult || typeof sqlResult === 'string') return

    setIsChartLoading(true)
    try {
      const rows = convertToResult(sqlResult.rows)
      const { config } = await generateChartConfig(
        rows,
        children?.toString() || ''
      )
      setChartConfig(config)
      setShowChart(true)
    } catch (error) {
      toast({
        title: 'Error generating chart',
        description: 'Could not generate a chart for this data',
        variant: 'destructive',
      })
    }
    setIsChartLoading(false)
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
        <>
          <SqlResult result={sqlResult} />
          {typeof sqlResult !== 'string' && sqlResult.rows?.length > 0 && (
            <>
              {!showChart && (
                <Button
                  size={'sm'}
                  variant={'outline'}
                  onClick={handleShowChart}
                  disabled={isChartLoading}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Show Chart
                </Button>
              )}
              {showChart && chartConfig && (
                <div className="mt-4">
                  <DynamicChart
                    chartData={convertToResult(sqlResult.rows)}
                    chartConfig={chartConfig}
                  />
                </div>
              )}
            </>
          )}
        </>
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
