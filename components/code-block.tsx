'use client'

import { Check, Copy } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'
import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import 'prismjs/themes/prism-okaidia.css'
import { Button } from './ui/button'

export default function CodeBlock({
  children,
  language,
}: {
  children: React.ReactNode
  language?: string
}) {
  useEffect(() => {
    Prism.highlightAll()
  }, [children, language])

  if (typeof children === 'string' && children.length < 40) {
    return (
      <span className="bg-[#121211] text-[#f8f8f2] inline-block p-1 rounded-sm font-mono">
        {children}
      </span>
    )
  }
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback(async () => {
    try {
      navigator.clipboard.writeText(children as string)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1000)
    } catch (error) {
      console.error('Failed to copy to clipboard', error)
    }
  }, [children])

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
        <pre className="!bg-[#121211] !text-[#f8f8f2] w-full !p-5 !pt-8 text-sm rounded-md overflow-auto">
          <code className={`language-${language ?? 'markup'}`}>{children}</code>
        </pre>
      </div>
      {language === 'sql' && (
        <Button
          size={'sm'}
          variant={'outline'}
          onClick={() => {
            throw new Error('Not Implemented')
          }}
        >
          Run SQL
        </Button>
      )}
    </div>
  )
}
