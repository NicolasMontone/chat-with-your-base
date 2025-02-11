'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '../utils/supabase/server'

export async function changeName(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string

  if (!id || !name) {
    return { error: 'Missing id or name' }
  }

  if (name.length > 100) {
    return { error: 'Name must be less than 100 characters' }
  }

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: 'Unexpected error changing name' }
  }

  const { error: updateError } = await supabase
    .from('chats')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: 'Unexpected error changing name' }
  }

  revalidatePath('/app')

  return { success: 'Name changed successfully' }
}
