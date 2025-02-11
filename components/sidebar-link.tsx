'use client'

import { Link } from 'next-view-transitions'
import { SidebarMenuSubButton } from './ui/sidebar'
import { usePathname } from 'next/navigation'

export function SidebarLink(chat: { id: string; title: string }) {
  const pathname = usePathname()

  return (
    <SidebarMenuSubButton
      asChild
      className={`p-1 ${
        pathname.includes(chat.id) ? 'bg-accent' : ''
      } group relative`}
    >
      <Link href={`/app/${chat.id}`} className="w-full h-full" prefetch={true}>
        <span className="truncate">{chat.title}</span>
      </Link>
    </SidebarMenuSubButton>
  )
}
