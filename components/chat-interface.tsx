'use client'

import { useAppLocalStorage } from '@/hooks/use-app-state'
import Chat from './chat'
import ConnectionForm from './connection-form'

import { useEffect, useMemo, useState } from 'react'
import { Message } from 'ai'
import { User } from '@supabase/supabase-js'
import { useAppState } from '@/state'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { v4 } from 'uuid'

export default function ChatInterface({
  chat,
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
    // If we have no chat state yet, or if we're switching to a different chat
    if (!chatState || (chat && chat.id !== chatState.id)) {
      if (chat) {
        setChat({
          id: chat.id,
          name: chat.name,
          messages: chat.messages,
        })
      } else if (!chatState) {
        // Only set new chat if we don't have a chat state
        setChat({
          id: v4(),
          name: 'New Chat',
          messages: [],
        })
      }
    }
  }, [chat, chatState])

  const shouldShowChat = useMemo(() => {
    if (!isMounted) return false
    return !!value.connectionString
  }, [isMounted, value.connectionString])

  if (!isMounted) return null

  return (
    <>
      {shouldShowChat ? (
        <Chat
          initialId={chatState?.id ?? undefined}
          user={user}
          key={chatState?.id ?? 'new'}
        />
      ) : (
        <ConnectionForm setConnectionString={setValue} />
      )}
    </>
  )
}
