import { createClient } from '@/utils/supabase/server'

import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { redirect } from 'next/navigation'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex h-screen w-full">{children}</main>
    </SidebarProvider>
  )
}
