import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import ChatInterface from '@/components/chat-interface'

export default async function ProtectedPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <ChatInterface />
      </div>
    </div>
  )
}
