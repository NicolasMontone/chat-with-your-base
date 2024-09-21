'use client'

import { useLocalStorage } from 'usehooks-ts'
import Chat from './chat'
import ConnectionForm from './connection-form'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { AnimatePresence } from 'framer-motion'

export default function ChatInterface({ isCli }: { isCli: boolean }) {
  const isMounted = useIsMounted()
  const [value, setValue] = useLocalStorage('postgres-key', {
    connectionString: '',
  })

  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence>
      {value.connectionString !== '' ? (
        <div className="flex flex-col gap-4 pt-32 h-screen max-h-screen scroll-auto">
          <Chat />
        </div>
      ) : (
        <ConnectionForm setConnectionString={setValue} isCli={isCli} />
      )}
    </AnimatePresence>
  )
}
