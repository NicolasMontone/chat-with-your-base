import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

import ChatInterface from '@/components/chat-interface'
import { Message } from 'ai'

export default async function ProtectedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  const { data: chat } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!chat) {
    return redirect('/app')
  }

  return (
    <ChatInterface
      user={user}
      chat={{
        id: chat.id,
        name: chat.name,
        messages: JSON.parse(chat.messages as string) as Message[],
      }}
    />
  )
}
