import { getEnv } from "@/lib/env";

export function isMockMode(): boolean {
  return getEnv().isMockMode;
}
