import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("Gadget Zone Online POS"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn("Environment validation warning:", parsed.error.flatten().fieldErrors);
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL:
    parsed.success && parsed.data.NEXT_PUBLIC_SUPABASE_URL
      ? parsed.data.NEXT_PUBLIC_SUPABASE_URL
      : "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    parsed.success && parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? parsed.data.NEXT_PUBLIC_SUPABASE_ANON_KEY
      : "supabase-anon-key-not-configured",
  SUPABASE_SERVICE_ROLE_KEY:
    parsed.success && parsed.data.SUPABASE_SERVICE_ROLE_KEY
      ? parsed.data.SUPABASE_SERVICE_ROLE_KEY
      : undefined,
  NEXT_PUBLIC_APP_NAME:
    parsed.success && parsed.data.NEXT_PUBLIC_APP_NAME
      ? parsed.data.NEXT_PUBLIC_APP_NAME
      : "Gadget Zone Online POS",
  isSupabaseConfigured:
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};
