import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import ChatInterface from '@/components/chat-interface'

export default async function ProtectedPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isCli = process.env.IS_CLI === 'true'

  if (!user && !isCli) {
    return redirect('/login')
  }

  return <ChatInterface isCli={isCli} />
}
