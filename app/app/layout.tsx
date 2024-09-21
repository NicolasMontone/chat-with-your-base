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
    <>
      <Navbar user={user} isCli={isCli} />
      <div className="max-w-7xl flex flex-col gap-12 items-start">
        {children}
      </div>
    </>
  )
}
