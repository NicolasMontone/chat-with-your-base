'use client'

import { useTransitionRouter } from 'next-view-transitions'
import { Button } from './ui/button'

import { useAppState } from '../state'
import { v4 } from 'uuid'

export function NewChatSidebar() {
  const setChat = useAppState((state) => state.setChat)
  const router = useTransitionRouter()

  const handleClick = () => {
    setChat({
      id: v4(),
      name: 'New Chat',
      messages: [],
    })
    router.push('/app')
  }
  return (
    <Button variant="ghost" className="w-full" size="lg" onClick={handleClick}>
      New Chat
    </Button>
  )
}
