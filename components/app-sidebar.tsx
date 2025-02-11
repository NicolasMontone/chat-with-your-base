import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { MessageCircle } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Link } from 'next-view-transitions'

async function Items() {
  const client = await createClient()

  const {
    data: { user },
    error,
  } = await client.auth.getUser()

  if (error || !user) {
    return redirect('/login')
  }

  const { data: chats } = await client
    .from('chats')
    .select('*')
    .eq('user_id', user.id)
  return (
    <>
      {chats?.map((chat) => (
        <SidebarMenuItem key={chat.id}>
          <SidebarMenuButton asChild>
            <Link
              href={`/app/${chat.id}`}
              className="w-full h-full"
              prefetch={true}
            >
              <MessageCircle />
              <span className="truncate">{chat.name}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  )
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2">
              <Suspense
                fallback={
                  <>
                    {Array(6)
                      .fill(null)
                      .map((_, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton asChild>
                            <div className="w-full h-3 animate-pulse rounded-md bg-gray-200 dark:bg-foreground/10" />
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                  </>
                }
              >
                <Items />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
