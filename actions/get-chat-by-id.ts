'use server'

import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const getChatByIdSchema = z.object({
  id: z.string().uuid(),
})

export async function getChatById(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { success } = getChatByIdSchema.safeParse({ id })

  if (!success) {
    return { error: 'Invalid id' }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return { error: 'Auth error' }
  }

  // user owns the chat
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: 'Error fetching chat' }
  }

  return {
    data,
  }
}
