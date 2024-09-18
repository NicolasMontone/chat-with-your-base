'use client'

import { Link } from 'lucide-react'
import { logoutAction } from '@/actions/logout'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { AnimatePresence } from 'framer-motion'
import { useLocalStorage } from 'usehooks-ts'

export default function Navbar({ user }: { user: User | null }) {
  const [value, _setValue, removeValue] = useLocalStorage('postgres-key', {
    connectionString: '',
  })

  const mounted = useIsMounted

  if (!mounted) return null

  return (
    <AnimatePresence>
      <nav className="w-full p-4 flex items-center justify-end fixed left-0 top-0 z-10">
        {user ? (
          <div className="flex items-center gap-2">
            <p className="text-sm">Hello, {user.email}</p>
            {
              <AnimatePresence>
                {value.connectionString && (
                  <Button variant={'secondary'} onClick={() => removeValue()}>
                    Change Database
                  </Button>
                )}
              </AnimatePresence>
            }
            <form action={logoutAction}>
              <SubmitButton variant={'ghost'} pendingText="Logging out...">
                Logout
              </SubmitButton>
            </form>
          </div>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </nav>
    </AnimatePresence>
  )
}
