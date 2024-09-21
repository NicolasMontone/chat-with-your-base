'use server'

import OpenAI from 'openai'

export const validateOpenaiKey = async (
  openaiApiKey: string
): Promise<'Valid API key' | 'Invalid API key'> => {
  const client = new OpenAI({
    apiKey: openaiApiKey,
  })

  try {
    await client.models.list()
    return 'Valid API key'
  } catch (error) {
    return 'Invalid API key'
  }
}
