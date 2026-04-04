/**
 * Debrief Streaming Route Handler
 *
 * GET /api/debrief/[sessionId]
 *
 * Streams Kiro's post-workout analysis using the Vercel AI SDK.
 * Rate limited to prevent abuse. Requires authentication via RLS.
 *
 * Response: text/event-stream (Server-Sent Events)
 */

import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { createServerClient } from '@/lib/db/supabase'
import { checkRateLimit } from '@/lib/utils/rate-limit'
import { checkInputSafety } from '@/lib/ai/safety-filter'
import { getKiroSystemPrompt } from '@/lib/ai/kiro-voice'
import { getCompletedSessionSummary } from '@/lib/db/queries/sessions'
import { RATE_LIMIT_KEYS } from '@/lib/validation/schemas'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  try {
    // Authenticate
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Rate limit
    await checkRateLimit(user.id, RATE_LIMIT_KEYS.AI_DEBRIEF)

    // Load session
    const session = await getCompletedSessionSummary(sessionId)
    if (!session) {
      return new Response('Session not found', { status: 404 })
    }

    // Build debrief prompt
    const debriefPrompt = `Here is a completed workout session to debrief:

Session Duration: ${session.duration_seconds ? Math.round(session.duration_seconds / 60) : '?'} minutes
Total Sets (excluding warmups): ${session.total_sets}
Total Volume: ${Math.round(session.total_volume_kg)} kg
Muscles Worked: ${session.muscles_worked.join(', ')}

Sets logged:
${session.sets
  .map(
    (s) =>
      `- ${s.exercise_name}: Set ${s.set_number}: ${s.reps_completed} reps${s.weight_kg ? ` at ${s.weight_kg}kg` : ''}`
  )
  .join('\n')}

Provide a post-workout debrief following the debrief instructions. Reference actual numbers from the logged sets.`

    // Validate input
    const safety = await checkInputSafety(debriefPrompt)
    if (!safety.safe) {
      console.error('Debrief input failed safety check:', safety.reason)
      return new Response('Input validation failed', { status: 400 })
    }

    // Stream the debrief
    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: getKiroSystemPrompt('debrief'),
      prompt: debriefPrompt,
      temperature: 0.7,
      maxTokens: 800,
    })

    return result.toDataStreamResponse()
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Debrief streaming error:', message)
    return new Response('Internal server error', { status: 500 })
  }
}
