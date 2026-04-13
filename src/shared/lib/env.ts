import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'pruv', 'kaodev', 'kaoqas', 'kaoprd']),
  BACKEND_URL: z.string(),
  BASE_URL: z.string(),
})

const parsedEnv = envSchema.safeParse({
  NODE_ENV: import.meta.env.MODE,
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  BASE_URL: import.meta.env.BASE_URL,
})

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.issues)
  throw new Error('Invalid environment variables')
}

export const env = parsedEnv.data
