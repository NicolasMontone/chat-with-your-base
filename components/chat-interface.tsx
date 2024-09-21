'use client'

import { useAppState } from '@/hooks/use-app-state'
import Chat from './chat'
import ConnectionForm from './connection-form'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

export default function ChatInterface({ isCli }: { isCli: boolean }) {
  const isMounted = useIsMounted()
  const { value, setValue } = useAppState()

  const shouldShowChat = useMemo(() => {
    if (!isMounted) {
      return false
    }
    if (isCli) {
      return !!value.connectionString && !!value.openaiApiKey
    }
    return !!value.connectionString
  }, [
    isMounted,
    value.connectionString,
    value.openaiApiKey,
    value.model,
    isCli,
  ])

  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence>
      {shouldShowChat ? (
        <div className="flex flex-col gap-4 pt-32 h-screen max-h-screen scroll-auto">
          <Chat />
        </div>
      ) : (
        <ConnectionForm setConnectionString={setValue} isCli={isCli} />
      )}
    </AnimatePresence>
  )
}
