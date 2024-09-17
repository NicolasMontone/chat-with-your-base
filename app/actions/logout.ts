'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export const logoutAction = async () => {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect('/sign-in')
}
