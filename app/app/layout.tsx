import { createClient } from '@/utils/supabase/server'
import Navbar from '../../components/navbar'

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const isCli = process.env.IS_CLI === 'true'

  let user = null

  if (!isCli) {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  return (
    <main className="min-h-screen overflow-hidden flex flex-col items-center max-w-full mx-auto">
      <div className="h-screen w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
        <div className="flex flex-col gap-20 max-w-5xl">
          <Navbar user={user} isCli={isCli} />

          <div className="max-w-7xl flex flex-col gap-12 items-start">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
