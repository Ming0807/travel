import "server-only";

import { parseServerEnv } from "./server-env-core";
export type { ServerEnv } from "./server-env-core";
export { parseServerEnv } from "./server-env-core";

export function getServerEnv() {
  return parseServerEnv(process.env);
}
