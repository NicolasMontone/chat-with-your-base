'use client'

import { useAppLocalStorage } from '@/hooks/use-app-local-storage'
import Chat from './chat'
import ConnectionForm from './connection-form'

import { useEffect, useMemo } from 'react'
import { Message } from 'ai'
import { User } from '@supabase/supabase-js'
import { useAppState } from '@/state'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { v4 } from 'uuid'

export default function ChatInterface({
  chat: chatProp,
  user,
}: {
  chat:
    | {
        id: string
        name: string
        messages: Message[]
      }
    | undefined
  user: User
}) {
  const { value, setValue } = useAppLocalStorage()
  const { setChat, chat: chatState } = useAppState()

  const isMounted = useIsMounted()

  useEffect(() => {
    if (chatProp) {
      setChat(chatProp)
    } else {
      setChat({
        id: v4(),
        name: 'New Chat',
        messages: [],
      })
    }
  }, [setChat, chatProp])

  const shouldShowChat = useMemo(() => {
    if (!isMounted) return false
    return !!value.connectionString
  }, [isMounted, value.connectionString])

  if (!isMounted) return null
  if (!chatState?.id) return null

  return (
    <>
      {shouldShowChat ? (
        <Chat initialId={chatState.id} user={user} key={chatState.id} />
      ) : (
        <ConnectionForm setConnectionString={setValue} />
      )}
    </>
  )
}
