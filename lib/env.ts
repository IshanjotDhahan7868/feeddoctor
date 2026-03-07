import "server-only";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MOCK_MODE: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  ADMIN_PASS: z.string().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema> & {
  isMockMode: boolean;
};

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

let cachedEnv: AppEnv | null = null;

function parseMockMode(value?: string): boolean {
  if (!value) return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

function missingInProd(env: AppEnv): string[] {
  if (env.NODE_ENV !== "production" || env.isMockMode) {
    return [];
  }

  const required = [
    "DATABASE_URL",
    "SITE_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_PRICE_ID",
    "STRIPE_WEBHOOK_SECRET",
  ] as const;

  return required.filter((key) => !env[key]);
}

export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const parsed = EnvSchema.parse(process.env);
  const env: AppEnv = {
    ...parsed,
    isMockMode: parseMockMode(parsed.MOCK_MODE),
  };

  const missing = missingInProd(env);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for production non-mock mode: ${missing.join(", ")}`
    );
  }

  cachedEnv = env;
  return env;
}

export function getEnvHealth() {
  const env = getEnv();
  return {
    nodeEnv: env.NODE_ENV,
    mockMode: env.isMockMode,
    hasDatabaseUrl: Boolean(env.DATABASE_URL),
    hasSiteUrl: Boolean(env.SITE_URL),
    hasStripeSecretKey: Boolean(env.STRIPE_SECRET_KEY),
    hasStripePriceId: Boolean(env.STRIPE_PRICE_ID),
    hasStripeWebhookSecret: Boolean(env.STRIPE_WEBHOOK_SECRET),
    hasResendApiKey: Boolean(env.RESEND_API_KEY),
  };
}
