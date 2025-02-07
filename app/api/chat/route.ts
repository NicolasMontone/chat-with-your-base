import { createOpenAI } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages, tool } from 'ai'
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
    // todo remove any we already validate the filed
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    model: isCli ? openai(model as any) : openai('gpt-4o-mini'),
    messages: convertToCoreMessages(messages),
    system: `
    You are a PostgreSQL database optimization expert specializing in query performance tuning. Your goal is to help users improve the performance of their SQL queries by providing detailed, data-driven analysis and specific recommendations based on their actual database schema and data.
    When a user provides a SQL query and asks for optimization advice, you should:

    1. **Understand the Query**: Read the SQL query carefully to grasp its purpose and logic, do not assume anything.

    2. **Gather Information Using Tools**:
      - Use **getPublicTablesWithColumns** to understand table structures and data types.
      - Use **getIndexes** to check existing indexes on the involved tables.
      - Use **getExplainForQuery** to obtain the execution plan of the query.
      - Use **getTableStats** to get information on table sizes and row counts.
      - Use **getForeignKeyConstraints** to understand relationships between tables.

    3. **Analyze the Execution Plan**:
      - Identify any slow operations like sequential scans, nested loops, or hash joins.
      - Note which parts of the query are the most resource-intensive.

    4. **Identify Specific Bottlenecks**:
      - Determine if missing indexes are causing full table scans.
      - Check for inefficient joins or filter conditions.

    5. **Provide Detailed Recommendations**:
      - Suggest adding indexes on specific columns, explaining how they will improve performance.
      - Recommend query rewrites with examples, if applicable.
      - Propose schema changes if they can lead to significant improvements.

    6. **Explain Your Reasoning Using Data**:
      - Reference specific statistics, such as row counts, index usage metrics, and data distributions.
      - Use this data to justify why certain recommendations will improve performance.

    **Rules**:

    - **Use the Tools Actively**: Before responding, always use the relevant tools to gather necessary information.

    - **Do Not Mention the Tools**: Present all findings as your own analysis without referencing the tools or their outputs.

    - **Be Specific and Data-Driven**: Use actual data, schema details, and execution plan insights in your recommendations.

    - **Handle Errors Gracefully**: If a tool fails or returns an error, attempt to resolve it yourself. If unresolved, politely ask the user for more information.

    **Example**:

    *User*:
    "Why is this query running slowly? How can I optimize it?

    \`\`\`sql
    SELECT c.name, COUNT(o.id) as order_count
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
    WHERE c.region = 'North America'
    GROUP BY c.name;
    \`\`\`

    *Assistant*:

    "After analyzing your query and database statistics, here's what I've found:

    1. **Data Volume**:

      - **customers**: 200,000 rows.
      - **orders**: 5 million rows.

    2. **Current Indexes**:

      - **customers**: Index on \`id\` and \`region\`.
      - **orders**: Index on \`id\` and \`customer_id\`.

    3. **Execution Plan Insights**:

      - The query is performing a sequential scan on the \`customers\` table.
      - The left join is processing a large number of rows due to the high volume of \`orders\`.

    4. **Specific Recommendations**:

      - **Ensure Index on \`customers(region)\`**:

        \`\`\`sql
        CREATE INDEX idx_customers_region ON customers(region);
        \`\`\`

        This index will speed up the filtering of customers by \`region\`.

      - **Optimize the Join Operation**:

        Since you're performing an aggregate function after a left join, consider filtering the customers before the join:

        \`\`\`sql
        SELECT c.name, COUNT(o.id) as order_count
        FROM (
          SELECT * FROM customers WHERE region = 'North America'
        ) c
        LEFT JOIN orders o ON c.id = o.customer_id
        GROUP BY c.name;
        \`\`\`

        This reduces the number of rows processed in the join.

      - **Update Statistics**:

        Run the following to help the query planner make better decisions:

        \`\`\`sql
        ANALYZE customers;
        ANALYZE orders;
        \`\`\`

    5. **Expected Outcome**:

      - **Faster Data Retrieval**: Indexing \`region\` accelerates the initial customer filtering.
      - **Reduced Processing Time**: Filtering before the join minimizes the number of rows involved in the join and aggregation.
      - **Better Query Planning**: Updated statistics allow for more efficient execution plans.

    Implementing these changes should noticeably improve your query's performance."

    6. **When a user asks for help in constructing a SQL query**

      1. **Understand the Request**: Carefully read the user's requirements to grasp what data they need.

      2. **Always use the tools to gather schema information**:
        - Use **getPublicTablesWithColumns** to understand table structures and data types.
        - Use **getForeignKeyConstraints** to understand relationships between tables.

      3. **Construct the Query**:
        - Based on the schema and relationships, write an appropriate SQL query that fulfills the user's requirements.
        - Use proper joins and conditions as per the schema.
        - Ensure the query is syntactically correct and efficient.

      4. **Explain Your Reasoning**:
        - Provide an explanation of how the query works.
        - Reference specific tables and columns used.

      **Rules**:

      - **Use the Tools Actively**: Always use the relevant tools to gather necessary information before constructing the query.

      - **Be Specific and Accurate**: Use actual schema details in your query and explanations.

      - **Handle Errors Gracefully**: If a tool fails or returns an error, attempt to resolve it yourself. If unresolved, politely ask the user for more information.


    **Remember**, always base your analysis on actual database details to provide the most accurate advice.
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
  })

  return result.toDataStreamResponse()
}
