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

    await client.end()

    return tablesWithColumns
  } catch (error) {
    console.error('Error fetching tables with columns:', error)
    await client.end()
    return `Error fetching tables with columns: ${error}`
  }
}

export async function getExplainForQuery(
  query: string,
  connectionString: string
) {
  const explainAnalyzeRegex = /explain\s+analyze\s+(.*)/i
  const explainRegex = /explain\s+(.*)/i

  let queryToRun = query

  const match =
    queryToRun.match(explainAnalyzeRegex) || queryToRun.match(explainRegex)

  if (match) {
    // Remove EXPLAIN or EXPLAIN ANALYZE
    queryToRun = match[1].trim()
  }

  const client = new PGClient(connectionString)

  try {
    await client.connect()

    const explain = await client.query(`EXPLAIN (FORMAT JSON) ${queryToRun}`)
    await client.end()

    return explain.rows[0]['QUERY PLAN']
  } catch (error) {
    console.error('Error running EXPLAIN:', error)
    await client.end()
    return `Error running EXPLAIN: ${error}`
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

    await client.end()
    return result.rows
  } catch (error) {
    console.error('Error fetching index stats usage:', error)
    await client.end()
    return `Error fetching index stats usage: ${error}`
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

    await client.end()
    return result.rows
  } catch (error) {
    console.error('Error fetching indexes:', error)
    await client.end()
    return `Error fetching indexes: ${error}`
  }
}

export async function getTableStats(connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const result = await client.query(`
      SELECT
        schemaname,
        relname as table_name,
        n_live_tup as row_count,
        pg_total_relation_size(relid) as total_size,
        pg_relation_size(relid) as table_size,
        pg_indexes_size(relid) as indexes_size,
        last_vacuum,
        last_analyze
      FROM
        pg_stat_user_tables
      ORDER BY
        total_size DESC;
    `)
    await client.end()
    return result.rows
  } catch (error) {
    console.error('Error fetching table stats:', error)
    await client.end()
    return `Error fetching table stats: ${error}`
  }
}

export async function getColumnStats(connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const result = await client.query(`
      SELECT
        schemaname,
        tablename,
        attname as column_name,
        n_distinct::float,
        null_frac,
        avg_width,
        most_common_vals,
        most_common_freqs
      FROM
        pg_stats
      WHERE
        schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY
        schemaname,
        tablename,
        attname;
    `)
    await client.end()
    return result.rows
  } catch (error) {
    console.error('Error fetching column stats:', error)
    await client.end()
    return `Error fetching column stats: ${error}`
  }
}

export async function getDetailedIndexStats(connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const result = await client.query(`
      SELECT
        s.schemaname,
        s.relname as table_name,
        s.indexrelname as index_name,
        s.idx_scan as index_scans,
        s.idx_tup_read as tuples_read,
        s.idx_tup_fetch as tuples_fetched,
        pg_relation_size(s.indexrelid) as index_size
      FROM
        pg_stat_user_indexes s
        JOIN pg_index i ON s.indexrelid = i.indexrelid
      ORDER BY
        s.idx_scan DESC;
    `)
    await client.end()
    return result.rows
  } catch (error) {
    console.error('Error fetching detailed index stats:', error)
    await client.end()
    return `Error fetching detailed index stats: ${error}`
  }
}

export async function getForeignKeyConstraints(connectionString: string) {
  const client = new PGClient(connectionString)
  await client.connect()

  try {
    const result = await client.query(`
      SELECT
        tc.table_schema,
        tc.table_name,
        kcu.column_name,
        ccu.table_schema AS foreign_table_schema,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY';
    `)
    await client.end()
    return result.rows
  } catch (error) {
    console.error('Error fetching foreign key constraints:', error)
    await client.end()
    return `Error fetching foreign key constraints: ${error}`
  }
}

