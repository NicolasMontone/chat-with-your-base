'use client'

import { Link } from 'next-view-transitions'
import { Button } from './ui/button'

import { useAppState } from '../state'

export function NewChatSidebar() {
  const setChat = useAppState((state) => state.setChat)

  const handleClick = () => {
    setChat(null)
  }
  return (
    <Link href="/app" className="w-full">
      <Button
        variant="ghost"
        className="w-full"
        size="lg"
        onClick={handleClick}
      >
        New Chat
      </Button>
    </Link>
  )
}
