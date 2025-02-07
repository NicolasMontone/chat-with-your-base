'use server'

import { Client } from 'pg'

export async function runSql(sql: string, connectionString: string) {
  if (
    sql.trim().toLowerCase().includes('drop') ||
    sql.trim().toLowerCase().includes('delete') ||
    sql.trim().toLowerCase().includes('alter') ||
    sql.trim().toLowerCase().includes('truncate') ||
    sql.trim().toLowerCase().includes('grant') ||
    sql.trim().toLowerCase().includes('revoke')
  ) {
    const action = sql.trim().toLowerCase().includes('drop')
      ? 'DROP'
      : sql.trim().toLowerCase().includes('delete')
        ? 'DELETE'
        : sql.trim().toLowerCase().includes('alter')
          ? 'ALTER'
          : sql.trim().toLowerCase().includes('truncate')
            ? 'TRUNCATE'
            : sql.trim().toLowerCase().includes('grant')
              ? 'GRANT'
              : 'REVOKE'

    return `This action is not allowed ${action}`
  }
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
