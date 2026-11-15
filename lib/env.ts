import { z } from 'zod';

const envSchema = z.object({
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_AUTH_URL: z.string().url(),
  EXPO_PUBLIC_GLOBOID_BASE_URL: z.string().url(),
  EXPO_PUBLIC_GLOBOID_CLIENT_ID: z.string().min(1),
  EXPO_PUBLIC_GLOBOID_TOKEN_KEY_LOCAL_STORAGE: z.string().min(1),
});

const parsed = envSchema.safeParse({
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  EXPO_PUBLIC_AUTH_URL: process.env.EXPO_PUBLIC_AUTH_URL,
  EXPO_PUBLIC_GLOBOID_BASE_URL: process.env.EXPO_PUBLIC_GLOBOID_BASE_URL,
  EXPO_PUBLIC_GLOBOID_CLIENT_ID: process.env.EXPO_PUBLIC_GLOBOID_CLIENT_ID,
  EXPO_PUBLIC_GLOBOID_TOKEN_KEY_LOCAL_STORAGE:
    process.env.EXPO_PUBLIC_GLOBOID_TOKEN_KEY_LOCAL_STORAGE,
});

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path[0]).join(', ');
  throw new Error(`[env] Variáveis de ambiente inválidas ou ausentes: ${missing}`);
}

export const env = parsed.data;
