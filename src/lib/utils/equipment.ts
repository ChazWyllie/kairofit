/**
 * Equipment Utilities
 *
 * Deterministic equipment classification logic.
 * Lives in src/lib/utils/ per CLAUDE.md architecture rule:
 * "Deterministic code owns programming logic."
 */

/**
 * Classify user equipment into a bucket for fallback program lookup.
 * Matches the equipment_type CHECK constraint in fallback_programs.
 */
export function classifyEquipmentBucket(
  equipment: string[]
): 'full_gym' | 'dumbbells_only' | 'home' | 'bodyweight' {
  const has = (item: string) => equipment.includes(item)
  if (has('barbells') && has('squat_rack') && has('cables_machines')) return 'full_gym'
  if (has('dumbbells') || has('kettlebells')) return 'dumbbells_only'
  if (has('resistance_bands') || has('pull_up_bar')) return 'home'
  return 'bodyweight'
}
