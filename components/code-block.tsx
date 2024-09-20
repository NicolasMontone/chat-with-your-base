'use client'

import { Check, Copy } from 'lucide-react'
import { useCallback, useState } from 'react'

export default function CodeBlock({ children }: { children: React.ReactNode }) {
  if (typeof children === 'string' && children.length < 40) {
    return (
      <span className="bg-secondary text-secondary-foreground inline-block p-[2px] rounded-sm font-mono">
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
    <div
      className={
        'bg-secondary text-secondary-foreground w-full p-4 text-sm flex flex-col gap-1 rounded-md relative my-3'
      }
    >
      <div className="w-full flex justify-end py-1">
        <div className="w-4 h-4">
          {copied ? (
            <Check size={15} />
          ) : (
            <Copy
              size={15}
              onClick={copyToClipboard}
              className="cursor-pointer"
            />
          )}
        </div>
      </div>
      <pre className="overflow-auto max-w-full">
        <code>{children}</code>
      </pre>
    </div>
  )
}
