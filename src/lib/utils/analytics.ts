import { PostHog } from 'posthog-node'

/**
 * Fire-and-forget server-side analytics via posthog-node.
 *
 * Wrap in Next.js after() so it never delays the response:
 *   after(() => trackServer(userId, EVENTS.WORKOUT_COMPLETED, { total_sets: 12 }))
 *
 * No-ops gracefully when NEXT_PUBLIC_POSTHOG_KEY is absent (CI, tests).
 */
export async function trackServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
  if (!key) return

  const client = new PostHog(key, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
    flushAt: 1,
    flushInterval: 0,
  })

  client.capture({ distinctId, event, properties })

  try {
    await client.shutdownAsync()
  } catch {
    // Flush failure is non-fatal - analytics must never block the user
  }
}
