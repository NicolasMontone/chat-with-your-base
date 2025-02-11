import { createClient } from '@/utils/supabase/server'
import Navbar from '@/components/navbar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
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
      <main className="min-h-screen overflow-hidden flex flex-col items-center max-w-full mx-auto w-full">
        <div className="h-screen w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
          <div className="flex flex-col gap-20 w-full h-full">
            <Navbar user={data.user} />

            {children}
          </div>
        </div>
      </main>
    </SidebarProvider>
  )
}
