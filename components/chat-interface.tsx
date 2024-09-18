'use client'

import { useLocalStorage } from 'usehooks-ts'
import Chat from './chat'
import ConnectionForm from './connection-form'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { AnimatePresence } from 'framer-motion'

export default function ChatInterface() {
  const isMounted = useIsMounted()
  const [value, setValue, removeValue] = useLocalStorage('postgres-key', {
    connectionString: '',
  })

  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence>
      {value.connectionString !== '' ? (
        <div className="flex flex-col gap-4 pt-40 h-screen max-h-screen scroll-auto">
          <Chat />
        </div>
      ) : (
        <ConnectionForm setConnectionString={setValue} />
      )}
    </AnimatePresence>
  )
}
