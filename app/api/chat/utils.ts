import { Client as PGClient } from 'pg'

export async function getPublicTablesWithColumns(connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    // Get tables
    const tablesRes = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `)

    // Get columns for each table
    const tablesWithColumns = await Promise.all(
      tablesRes.rows.map(async (table) => {
        const columnsRes = await client.query(
          `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = $1 AND table_name = $2
        ORDER BY ordinal_position
      `,
          [table.table_schema, table.table_name]
        )

        return {
          tableName: table.table_name,
          schemaName: table.table_schema,
          columns: columnsRes.rows.map((col) => ({
            name: col.column_name,
            type: col.data_type,
            isNullable: col.is_nullable === 'YES',
          })),
        }
      })
    )

    return tablesWithColumns
  } catch (error) {
    console.error('Error fetching tables with columns:', error)
    throw error
  } finally {
    await client.end()
  }
}

export async function getExplainForQuery(
  query: string,
  connectionString: string
) {
  const explainAnalyzeRegex = /explain\s+analyze\s+(.*)/i
  const explainRegex = /explain\s+(.*)/i

  let queryToRun = query.toLowerCase()

  const match =
    queryToRun.match(explainAnalyzeRegex) || queryToRun.match(explainRegex)

  if (match) {
    // remove explain analyze
    queryToRun = queryToRun.replace(match[0], match[1].trim())
  }

  console.log('queryToRun', queryToRun)
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const explain = await client.query(`EXPLAIN ANALYZE ${queryToRun}`)
    return explain.rows[0].query_plan
  } catch (error) {
    console.error('Error fetching explain for query:', error)
    throw error
  } finally {
    await client.end()
  }
}

const MAX_LIMIT = 100

export async function runQuery(query: string, connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  const limitRegex = /LIMIT\s*(\d+)/i
  const limitMatch = query.match(limitRegex)

  const queryWithLimit = limitMatch ? query : `${query} LIMIT ${MAX_LIMIT}`

  try {
    const result = await client.query(queryWithLimit)
    return result.rows
  } catch (error) {
    console.error('Error running query:', error)
    throw error
  } finally {
    await client.end()
  }
}

export async function getIndexStatsUsage(connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const result = await client.query(`
      SELECT
      schemaname,
      relname,
      indexrelname,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch
    FROM
      pg_stat_user_indexes
    ORDER BY
      schemaname,
      relname,
      indexrelname;
    `)

    return result.rows
  } catch (error) {
    console.error('Error fetching index stats usage:', error)
    throw error
  } finally {
    await client.end()
  }
}

export async function getIndexes(connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const result = await client.query(`
  SELECT
      indexname,
      tablename,
      schemaname,
      indexdef
    FROM
      pg_indexes
    WHERE
      schemaname NOT IN ('pg_catalog', 'information_schema')
    ORDER BY
      schemaname,
      tablename,
      indexname;
    `)

    return result.rows
  } catch (error) {
    console.error('Error fetching indexes:', error)
    throw error
  } finally {
    await client.end()
  }
}
