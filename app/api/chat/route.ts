import { createOpenAI } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages, tool, smoothStream } from 'ai'
import { headers } from 'next/headers'
import { z } from 'zod'
import {
  getExplainForQuery,
  getForeignKeyConstraints,
  getIndexes,
  getIndexStatsUsage,
  getPublicTablesWithColumns,
  getTableStats,
} from './utils'

const isCli = process.env.IS_CLI === 'true'
// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const connectionString = headers().get('x-connection-string')
  const openaiApiKey = headers().get('x-openai-api-key')
  const model = headers().get('x-model')

  if (!connectionString) {
    return new Response('No connection string provided', { status: 400 })
  }

  if (isCli && !openaiApiKey) {
    return new Response('No OpenAI API key provided', { status: 400 })
  }

  if (isCli && !model) {
    return new Response('No model provided', { status: 400 })
  }

  const projectOpenaiApiKey = process.env.OPENAI_API_KEY

  const openai = createOpenAI({
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    apiKey: isCli ? openaiApiKey! : projectOpenaiApiKey!,
  })

  const result = await streamText({
    // todo remove any we already validate the field
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    model: isCli ? openai(model as any) : openai('gpt-4o-mini'),
    messages: convertToCoreMessages(messages),
    system: `
  You are a PostgreSQL database optimization expert specializing in both query performance tuning and SQL query construction. Your primary objective is to always provide a direct, complete, and executable SQL query as your response whenever possible, rather than vague or generic explanations.
  
  **Direct Query Response Requirement:**
  - In at least 99% of interactions, if the user's request is related to retrieving data or constructing a query (e.g. "How many users do I have?"), your response must include a SQL query enclosed in a code block. For example, for "How many users do I have?" a correct response would be:
    
    \`\`\`sql
    SELECT COUNT(*) FROM users;
    \`\`\`
  
  - If any clarifications are needed, ask succinct questions first; otherwise, always lean towards providing a ready-to-run SQL query.
  - Even when providing optimization advice, include any revised or recommended SQL queries as part of your answer.
  
  When a user provides a SQL query or asks for advice on query performance, you should follow these steps:
  
  1. **Understand the Query or Request**:  
     - Read the SQL query or question carefully to grasp its intent and logic. Do not make assumptions.
     - If the user's question appears incomplete or ambiguous, ask for clarification before proceeding.
  
  2. **Gather Information Using Tools**:  
     - Use **getPublicTablesWithColumns** to understand table structures and data types.
     - Use **getIndexes** to inspect existing indexes on the involved tables.
     - Use **getExplainForQuery** to analyze the execution plan.
     - Use **getTableStats** for table sizes and row counts.
     - Use **getForeignKeyConstraints** to clarify table relationships.
    
  3. **Analyze and Optimize**:
     - **For Performance Tuning**:  
       - Identify slow operations (e.g., sequential scans, nested loops, or hash joins).
       - Spot potential missing indexes or inefficient join conditions.
       - Provide data-driven recommendations including precise SQL commands to add indexes or rewrite parts of the query.
     - **For Query Construction**:  
       - Directly craft a complete SQL query that answers the user's request.  
       - Use actual table and column names based on schema information.
    
  4. **Respond with a SQL Query**:
     - Your answer should **always** include a SQL query (in a code block) that directly addresses the user's request.
     - Optionally, include a brief explanation below the query, but the query itself must be front and center.
  
  5. **Handle Errors Gracefully**:
     - If a tool fails or returns an error, try to resolve the issue or ask the user for more details before proceeding.
  
  **Example Scenario**:
  
  *User*:
  "How many users do I have?"
  
  *Your Ideal Response*:
  \`\`\`sql
  SELECT COUNT(*) AS total_users
  FROM users;
  \`\`\`
  
  *(Optionally followed by: "This query counts all rows in the users table, giving you the total number of users.")*
  
  **Remember**: Your response must be specific, data-driven, and always oriented towards providing an actionable SQL query rather than a vague explanation.
  
  By following these instructions, you ensure that almost every response directly translates the user's needs into an executable SQL query.
  `,
    maxSteps: 22,
    tools: {
      getPublicTablesWithColumns: tool({
        description:
          'Retrieves a list of tables and their columns from the connected PostgreSQL database.',
        execute: async () => {
          const tables = await getPublicTablesWithColumns(connectionString)
          return tables
        },
        parameters: z.object({}),
      }),

      getExplainForQuery: tool({
        description:
          "Analyzes and optimizes a given SQL query, providing a detailed execution plan in JSON format. If the query is not valid, it should return an error message. The function itself will add the EXPLAIN keyword to the query, so you don't need to include it.",
        execute: async ({ query }) => {
          const explain = await getExplainForQuery(query, connectionString)
          return explain
        },
        parameters: z.object({
          query: z.string().describe('The SQL query to analyze'),
        }),
      }),

      getIndexStatsUsage: tool({
        description: 'Retrieves usage statistics for indexes in the database.',
        execute: async () => {
          const indexStats = await getIndexStatsUsage(connectionString)
          return indexStats
        },
        parameters: z.object({}),
      }),

      getIndexes: tool({
        description: 'Retrieves the indexes present in the connected database.',
        execute: async () => {
          const indexes = await getIndexes(connectionString)
          return indexes
        },
        parameters: z.object({}),
      }),

      getTableStats: tool({
        description:
          'Retrieves statistics about tables, including row counts and sizes.',
        execute: async () => {
          const stats = await getTableStats(connectionString)
          return stats
        },
        parameters: z.object({}),
      }),

      getForeignKeyConstraints: tool({
        description:
          'Retrieves information about foreign key relationships between tables.',
        execute: async () => {
          const constraints = await getForeignKeyConstraints(connectionString)
          return constraints
        },
        parameters: z.object({}),
      }),
    },
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
      chunking: 'line', // optional: defaults to 'word'
    }),
  })

  return result.toDataStreamResponse()
}
