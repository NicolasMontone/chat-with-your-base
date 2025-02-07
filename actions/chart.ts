'use server'

import { openai } from '@ai-sdk/openai'
import { generateObject } from 'ai'

import { type Result, configSchema, type Config } from '@/lib/chart'

export const generateChartConfig = async (
  results: Result[],
  userQuery: string
) => {
  const system = 'You are a data visualization expert. '

  try {
    const { object: config } = await generateObject({
      model: openai('gpt-4o'),
      system,
      prompt: `Given the following data from a SQL query result, generate the chart config that best visualises the data and answers the users query.
      For multiple groups use multi-lines.

      Here is an example complete config:
      export const chartConfig = {
        type: "pie",
        xKey: "month",
        yKeys: ["sales", "profit", "expenses"],
        colors: {
          sales: "#4CAF50",    // Green for sales
          profit: "#2196F3",   // Blue for profit
          expenses: "#F44336"  // Red for expenses
        },
        legend: true
      }

      User Query:
      ${userQuery}

      Data:
      ${JSON.stringify(results, null, 2)}`,
      schema: configSchema,
    })

    const colors: Record<string, string> = {}
    config.yKeys.forEach((key, index) => {
      colors[key] = `hsl(var(--chart-${index + 1}))`
    })

    const updatedConfig: Config = { ...config, colors }
    return { config: updatedConfig }
  } catch (e) {
    // @ts-expect-errore
    console.error(e.message)
    throw new Error('Failed to generate chart suggestion')
  }
}
