'use client'
import { useAppState } from '../state'
import { SidebarLink } from './sidebar-link'
import {
  SidebarGroupLabel,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from './ui/sidebar'
import { useEffect } from 'react'

export function AppSidebarItems({
  chats: chatsProp,
}: {
  chats: {
    id: string
    name: string
    created_at: string
  }[]
}) {
  const { setChats, chats } = useAppState()
  useEffect(() => {
    setChats(chatsProp)
  }, [chatsProp])

  const now = new Date()

  const todayString = now.toISOString().split('T')[0]
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  )

  const yesterdayString = yesterday.toISOString().split('T')[0]

  const items: {
    title: string
    data: { title: string; id: string; createdAt: string }[]
  }[] = [
    { title: 'Today', data: [] },
    { title: 'Yesterday', data: [] },
    { title: 'Past', data: [] },
  ]

  for (const chat of chats || []) {
    // Compare to today & yesterday based on ISO string
    const chatDateString = new Date(chat.created_at).toISOString().split('T')[0]

    if (chatDateString === todayString) {
      items[0].data.push({
        title: chat.name!,
        id: chat.id,
        createdAt: chat.created_at,
      })
    } else if (chatDateString === yesterdayString) {
      items[1].data.push({
        title: chat.name!,
        id: chat.id,
        createdAt: chat.created_at,
      })
    } else {
      items[2].data.push({
        title: chat.name!,
        id: chat.id,
        createdAt: chat.created_at,
      })
    }
  }

  // Sort each group's data in descending order by created_at,
  // so the newest items appear first within each group.
  for (const group of items) {
    group.data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  // Filter out empty groups
  const filteredItems = items.filter((item) => item.data.length > 0)

  return (
    <>
      {filteredItems?.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarGroupLabel>
            <h3 className="text-lg font-medium p-1 text-foreground">
              {item.title}
            </h3>
          </SidebarGroupLabel>
          <SidebarMenuSub>
            {item.data.map((chat) => (
              <SidebarMenuSubItem key={chat.id}>
                <SidebarLink id={chat.id} title={chat.title} />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      ))}
    </>
  )
}
