import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Suspense } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { SidebarLink } from './sidebar-link'
import { Button } from './ui/button'
import { Link } from 'next-view-transitions'
import { NewChatSidebar } from './new-chat-sidebar'

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
    .order('created_at', { ascending: false })

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

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <svg
              width="57"
              height="59"
              viewBox="0 0 57 59"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_9)">
                <rect width="57" height="59" fill="transparent" />
                <g clipPath="url(#clip1_1_9)">
                  <path
                    d="M28 18.3333C40.0122 18.3333 49.75 15.0874 49.75 11.0833C49.75 7.07926 40.0122 3.83333 28 3.83333C15.9878 3.83333 6.25 7.07926 6.25 11.0833C6.25 15.0874 15.9878 18.3333 28 18.3333Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.25 11.0833V44.9167C6.25 46.8395 8.54151 48.6836 12.6204 50.0432C16.6993 51.4028 22.2315 52.1667 28 52.1667C33.7685 52.1667 39.3007 51.4028 43.3796 50.0432C47.4585 48.6836 49.75 46.8395 49.75 44.9167V11.0833"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.25 28C6.25 29.9228 8.54151 31.7669 12.6204 33.1265C16.6993 34.4862 22.2315 35.25 28 35.25C33.7685 35.25 39.3007 34.4862 43.3796 33.1265C47.4585 31.7669 49.75 29.9228 49.75 28"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <g clipPath="url(#clip2_1_9)">
                    <rect
                      x="6"
                      y="16"
                      width="81"
                      height="81"
                      fill="transparent"
                    />
                    <path
                      d="M47 46V43H44"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M51.5 46H42.5C41.6716 46 41 46.6716 41 47.5V53.5C41 54.3284 41.6716 55 42.5 55H51.5C52.3284 55 53 54.3284 53 53.5V47.5C53 46.6716 52.3284 46 51.5 46Z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M39.5 50.5H41"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M53 50.5H54.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M49.25 49.75V51.25"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M44.75 49.75V51.25"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                </g>
              </g>
              <defs>
                <clipPath id="clip0_1_9">
                  <rect width="57" height="59" fill="transparent" />
                </clipPath>
                <clipPath id="clip1_1_9">
                  <rect
                    width="58"
                    height="58"
                    fill="transparent"
                    transform="translate(-1 -1)"
                  />
                </clipPath>
                <clipPath id="clip2_1_9">
                  <rect
                    x="38"
                    y="40"
                    width="18"
                    height="18"
                    rx="9"
                    fill="transparent"
                  />
                </clipPath>
              </defs>
            </svg>
          </SidebarGroupLabel>
          <SidebarGroupLabel className="my-2">
            <NewChatSidebar />
          </SidebarGroupLabel>

          <SidebarGroupContent className="flex flex-col gap-2 max-h-[50%] overflow-y-auto">
            <SidebarMenu>
              <Suspense
                fallback={
                  <>
                    {Array(6)
                      .fill(null)
                      .map((_, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton asChild>
                            <div className="w-full h-3 animatePulse rounded-md bg-gray-200 dark:bg-foreground/10" />
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
