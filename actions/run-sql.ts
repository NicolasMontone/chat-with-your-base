'use server'

import { Client } from 'pg'

export async function runSql(sql: string, connectionString: string) {
  const client = new Client({
    connectionString,
  })

  try {
    await client.connect()
    const result = await client.query(sql)
    await client.end()

    return JSON.stringify(result)
  } catch (error) {
    await client.end()
    if (error instanceof Error) {
      return error.message
    }
    return 'Unknown error'
  }
}
