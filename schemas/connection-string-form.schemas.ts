import { z } from 'zod'

export const connectionStringFormSchema = z.object({
  connectionString: z.string().min(1),
})
