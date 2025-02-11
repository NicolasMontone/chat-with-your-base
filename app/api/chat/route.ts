import { createOpenAI } from '@ai-sdk/openai'
import {
  streamText,
  convertToCoreMessages,
  tool,
  smoothStream,
  appendResponseMessages,
} from 'ai'
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
import { createClient } from '@/utils/supabase/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  console.log('Starting POST request handler')
  const client = await createClient()
  const { data } = await client.auth.getUser()
  const user = data.user
  if (!user) {
    console.log('Unauthorized: No user found')
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, id } = await req.json()
  console.log('Request payload:', { id, messageCount: messages?.length })

  const headers_ = await headers()
  const connectionString = headers_.get('x-connection-string')
  const openaiApiKey = headers_.get('x-openai-api-key')
  const model = headers_.get('x-model')

  if (!id) {
    console.log('Bad request: No id provided')
    return new Response('No id provided', { status: 400 })
  }

  const idParsed = z.string().uuid().safeParse(id)
  if (!idParsed.success) {
    console.log('Bad request: Invalid UUID format', id)
    return new Response('Invalid id', { status: 400 })
  }

  // check if the chat exists
  const { data: chat, error } = await client
    .from('chats')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Database error when fetching chat:', error)
    return new Response('Error fetching chat', { status: 500 })
  }

  // is chat from user
  if (chat && chat.user_id !== user.id) {
    console.log('Unauthorized: Chat belongs to different user', {
      chatUserId: chat.user_id,
      requestUserId: user.id,
    })
    return new Response('Unauthorized', { status: 401 })
  }

  if (!connectionString) {
    console.log('Bad request: Missing connection string')
    return new Response('No connection string provided', { status: 400 })
  }

  const projectOpenaiApiKey = process.env.OPENAI_API_KEY

  const openai = createOpenAI({
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    apiKey: projectOpenaiApiKey!,
  })

  const result = streamText({
    // todo remove any we already validate the field
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(messages),

    system: `
        You are a PostgreSQL database optimization expert specializing in both query performance tuning and SQL query construction. Your primary objective is to always provide a direct, complete, and executable SQL query as your response whenever possible, rather than vague or generic explanations.

      **Direct Query Response Requirement:**
      - In at least 99% of interactions, if the user's request is related to retrieving data or constructing a query (e.g. "How many users do I have?"), your response must include a SQL query enclosed in a code block. For example, for "How many users do I have?" a correct response would be:
        
        \`\`\`sql
        SELECT COUNT(*) AS total_users
        FROM users;
        \`\`\`

      - If any clarifications are needed, ask succinct questions first; otherwise, always lean towards providing a ready-to-run SQL query.
      - Even when providing optimization advice, include any revised or recommended SQL queries as part of your answer.

      **Schema Accuracy Requirement:**
      - **Always use the Tools:** Before constructing any SQL query, you **must** use the tool **getPublicTablesWithColumns** (and other relevant tools) to retrieve the actual schema details such as table names and column names.
      - **Do Not Guess:** If you are not provided with explicit schema details in the user's request, do not guess table or column names. Base your SQL query solely on the retrieved schema information.
      - **Confirm Details:** If the schema information is insufficient or unclear, ask the user for additional details instead of making assumptions.

      When a user provides a SQL query or asks for advice on query performance, follow these steps:

      1. **Understand the Query or Request**:  
        - Read the SQL query or question carefully to grasp its intent and logic. Do not make assumptions.
        - If the user's question appears incomplete or ambiguous, ask for clarification before proceeding.

      2. **Gather Information Using Tools**:  
        - Use **getPublicTablesWithColumns** to obtain up-to-date table structures and column names.
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
          - Reference actual table and column names based on the schema information gathered from the tools.
        
      4. **Respond with a SQL Query**:
        - Your answer should **always** include a SQL query (in a code block) that directly addresses the user's request.
        - Optionally, include a brief explanation below the query, but the query itself must be front and center.

      5. **Handle Errors Gracefully**:
        - If a tool fails or returns an error, try to resolve the issue or ask the user for more details before proceeding.

      **Example Scenario**:

      *User*:
      "How many users do I have?"

      *Your Ideal Response*:
      1. **Retrieve Schema Details:**  
        - Use the **getPublicTablesWithColumns** tool to confirm that a table named \`users\` exists.
      2. **Provide the SQL Query:**
      \`\`\`sql
      SELECT COUNT(*) AS total_users
      FROM users;
      \`\`\`
      *(Optionally followed by a brief explanation: "This query counts all rows in the 'users' table to give you the total number of users.")*

      **Remember**: Your response must be specific, data-driven, and always oriented towards providing an actionable SQL query that is based on the actual schema details. Do not assume or guess table/column names if they are not provided by the schema tools.

      By following these instructions, you ensure that nearly every response is a concrete, executable SQL query fully grounded in the actual database schema.
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
    onFinish: async ({ response }) => {
      console.log('Stream completed, updating database')
      try {
        if (chat) {
          console.log('Updating existing chat:', id)
          await client
            .from('chats')
            .update({
              messages: JSON.stringify(
                appendResponseMessages({
                  messages,
                  responseMessages: response.messages,
                })
              ),
            })
            .eq('id', id)
        } else {
          console.log('Creating new chat:', id)
          //   const generatedName = await generateText({
          //     model: openai('gpt-4o-mini'),
          //     system: `
          // You are an assistant that creates short, concise, and descriptive chat names for a PostgreSQL chatbot. The chat name should directly capture the essence of the conversation and be relevant to PostgreSQL topics. Your response must be only the title text with no extra words, labels, or prefixes (do not include "Title:" or similar).
          //   `,
          //     prompt: `The messages are <MESSAGES>${JSON.stringify(
          //       appendResponseMessages({
          //         messages,
          //         responseMessages: response.messages,
          //       })
          //     )}</MESSAGES>`,
          //   })
          //   console.log('Generated chat name:', generatedName.text)

          const { count } = await client
            .from('chats')
            .select('*', { count: 'exact' })
            .eq('user_id', user.id)

          const name = `Chat ${count ?? 0 + 1}`

          await client.from('chats').insert({
            id,
            user_id: user.id,
            messages: JSON.stringify(
              appendResponseMessages({
                messages,
                responseMessages: response.messages,
              })
            ),
            name,
            created_at: new Date().toISOString(),
          })
        }
        console.log('Database update completed successfully')
      } catch (error) {
        console.error('Error updating database:', error)
      }
    },
  })

  console.log('Returning stream response')
  return result.toDataStreamResponse()
}
