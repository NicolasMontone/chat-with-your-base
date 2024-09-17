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
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const explain = await client.query(`EXPLAIN ANALYZE ${query}`)
    return explain.rows[0].query_plan
  } catch (error) {
    console.error('Error fetching explain for query:', error)
    throw error
  } finally {
    await client.end()
  }
}
