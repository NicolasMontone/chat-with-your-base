'use server'

import { createClient } from '@/utils/supabase/server'

export async function getChats() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return { error: 'Auth error' }
  }

  const { data, error } = await supabase
    .from('chats')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: 'Error fetching chats' }
  }

  return { data }
}
