'use client'

import { useAppState } from '@/hooks/use-app-state'
import Chat from './chat'
import ConnectionForm from './connection-form'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { AnimatePresence } from 'motion/react'
import { useMemo } from 'react'

export default function ChatInterface() {
  const isMounted = useIsMounted()
  const { value, setValue } = useAppState()

  const shouldShowChat = useMemo(() => {
    if (!isMounted) {
      return false
    }

    return !!value.connectionString
  }, [isMounted, value.connectionString, value.openaiApiKey, value.model])

  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence>
      {shouldShowChat ? (
        <Chat />
      ) : (
        <ConnectionForm setConnectionString={setValue} />
      )}
    </AnimatePresence>
  )
}
