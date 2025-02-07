'use server'

import { Client } from 'pg'

export const validateDbConnection = async (
  connectionString: string
): Promise<'Valid connection' | string> => {
  const client = new Client({
    connectionString,
  })

  try {
    await client.connect()
    await client.query('SELECT 1')
    await client.end()
  } catch (error) {
    if (error instanceof Error) {
      console.log('error', error)
      return error.message
    }
    return 'Unknown error'
  }

  return 'Valid connection'
}
