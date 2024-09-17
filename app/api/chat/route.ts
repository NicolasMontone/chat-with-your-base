import { openai } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages, tool } from 'ai'
import { headers } from 'next/headers'
import { z } from 'zod'
import { getExplainForQuery, getPublicTablesWithColumns } from './utils'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const connectionString = headers().get('x-connection-string')

  if (!connectionString) {
    return new Response('No connection string provided', { status: 400 })
  }

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),
    system: `You are a database postgres SQL expert. You will reply to user questions with 
    - Great SQL queries
    - Great database design
    - Improvements to the database schema
    - Improvements to thae indexes

    You will have access to: 
    - tables: List of all tables in the database
    - columns: Detailed information about columns in each table
    - indexes: Information about existing indexes
    - tableStats: Statistics about table usage
    - indexStats: Statistics about index usage
    - queryPerformance: Information about recent or currently running queries
    - unusedIndexes: Indexes that are rarely used but consume resources
    - runExplain: Run the explain command on a SQL query
    `,
    tools: {
      getPublicTablesWithColumns: tool({
        description:
          'Retrieves a list of public tables and their columns from the connected PostgreSQL database.',
        execute: async () => {
          const tables = await getPublicTablesWithColumns(connectionString)
          return tables
        },
        parameters: z.object({}),
      }),
      getExplainForQuery: tool({
        description:
          'Analyzes and optimizes a given SQL query, providing detailed explanations for the query plan and execution in json format. If the query is not valid, it should return an error message.',
        execute: async ({ query }) => {
          const explain = await getExplainForQuery(query, connectionString)
          return explain
        },
        parameters: z.object({
          query: z.string().describe('The SQL query to analyze'),
        }),
      }),
    },
  })

  return result.toDataStreamResponse()
}
