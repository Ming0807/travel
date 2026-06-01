// Vitest mock for Next.js "server-only" module
// The real module throws when imported from a Client Component or non-server environment.
// In vitest tests (jsdom), we replace it with a no-op module.
export {};
