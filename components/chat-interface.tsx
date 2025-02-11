'use client'

import { useAppState } from '@/hooks/use-app-state'
import Chat from './chat'
import ConnectionForm from './connection-form'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { AnimatePresence } from 'motion/react'
import { useMemo } from 'react'
import { Message } from 'ai'
import { User } from '@supabase/supabase-js'

export default function ChatInterface({
  initialId,
  initialMessages,
  user,
}: {
  initialId?: string
  initialMessages?: Message[]
  user: User
}) {
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
    <>
      {shouldShowChat ? (
        <Chat
          initialId={initialId}
          initialMessages={initialMessages}
          user={user}
        />
      ) : (
        <ConnectionForm setConnectionString={setValue} />
      )}
    </>
  )
}
