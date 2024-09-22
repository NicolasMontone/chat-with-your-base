'use client'

import { QueryResult } from 'pg'
import { DataTable } from './table'

export default function SqlResult({
  result,
}: {
  result: QueryResult<unknown[]> | string
}) {
  if (typeof result === 'object' && 'fields' in result && 'rows' in result) {
    const headers = result.fields.map((field) => ({
      header: field.name,
      accessorKey: field.name,
    }))

    const processedRows = result.rows.map((row) => {
      const processedRow: Record<string, string> = {}
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'object' && value !== null) {
          processedRow[key] = JSON.stringify(value)
        } else {
          processedRow[key] = String(value)
        }
      }
      return processedRow
    })

    return <DataTable columns={headers} data={processedRows} />
  }

  return <pre>{JSON.stringify(result, null, 2)}</pre>
}
