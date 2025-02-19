'use server'

import { createClient } from '@/utils/supabase/server'

export async function getChats() {
  console.log('Starting getChats function')
  const supabase = await createClient()
  
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    console.error('Authentication error:', userError || 'No user found')
    return { error: 'Auth error' }
  }

  console.log('Authenticated user:', user.id)

  const { data, error } = await supabase
    .from('chats')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching chats:', error)
    return { error: 'Error fetching chats' }
  }

  console.log('Successfully fetched chats:', data?.length || 0, 'results')
  return { data }
}
