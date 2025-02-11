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

  console.log(chat?.messages)

  return (
    <ChatInterface
      user={user}
      initialId={id}
      initialMessages={
        JSON.parse((chat?.messages as string) || '[]') as Message[] | undefined
      }
    />
  )
}
