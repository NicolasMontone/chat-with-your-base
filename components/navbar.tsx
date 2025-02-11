'use client'

import Link from 'next/link'
import { logoutAction } from '@/actions/logout'
import { SubmitButton } from '@/components/submit-button'
import { Button } from '@/components/ui/button'
import type { User } from '@supabase/supabase-js'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { AnimatePresence } from 'motion/react'
import { useAppState } from '@/hooks/use-app-state'
import { SidebarTrigger } from './ui/sidebar'

export default function Navbar({ user }: { user: User }) {
  const { value, setValue } = useAppState()
  const mounted = useIsMounted()

  if (!mounted) return null

  return (
    <AnimatePresence>
      <nav className="w-full p-4 flex items-center justify-between">
        <SidebarTrigger />

        {user ? (
          <div className="flex items-center gap-2">
            <p className="text-sm">Hello, {user.email}</p>
            {value.connectionString && (
              <AnimatePresence>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setValue((prev) => ({
                      ...prev,
                      connectionString: '',
                    }))
                  }
                >
                  Change Database
                </Button>
              </AnimatePresence>
            )}
            <form
              action={async () => {
                setValue({
                  connectionString: '',
                  openaiApiKey: '',
                  model: 'gpt-4o-mini',
                })

                await logoutAction()
              }}
            >
              <SubmitButton variant="ghost" pendingText="Logging out...">
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
