'use client'

import { Button } from './ui/button'

import { useAppState } from '../state'
import { v4 } from 'uuid'

export function NewChatSidebar() {
  const setChat = useAppState((state) => state.setChat)

  const handleClick = () => {
    setChat({
      id: v4(),
      name: 'New Chat',
      messages: [],
    })
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', '/app')
      } catch (error) {
        console.error('Error pushing state:', error)
      }
    }
  }
  return (
    <Button variant="ghost" className="w-full" size="lg" onClick={handleClick}>
      New Chat
    </Button>
  )
}
