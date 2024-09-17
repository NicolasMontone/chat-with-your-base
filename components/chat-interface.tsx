'use client'

import { useLocalStorage } from 'usehooks-ts'
import Chat from './chat'
import ConnectionForm from './connection-form'

export default function ChatInterface() {
  const [value, setValue, removeValue] = useLocalStorage('postgres-key', {
    connectionString: '',
  })

  return (
    <div>
      {value.connectionString !== '' ? (
        <Chat />
      ) : (
        <ConnectionForm setConnectionString={setValue} />
      )}
    </div>
  )
}
