import { ARCHETYPES } from '@/lib/onboarding/archetypes'

export function ArchetypeSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#6366F1]">
            Personality-matched training
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#F5F5F4] sm:text-5xl">
            Your archetype, your program
          </h2>
          <p className="text-lg text-[#A1A19E]">
            Not everyone responds to the same motivation style. Kiro identifies your training
            psychology and tailors program emphasis, science depth, and feedback style to match how
            you actually work.
          </p>
        </div>

        {/* Archetype grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.values(ARCHETYPES).map((archetype) => (
            <div
              key={archetype.id}
              className="rounded-2xl border border-white/5 bg-[#1A1A1F] p-6 transition-colors hover:border-white/10"
            >
              <div className="mb-3 text-2xl">{archetype.emoji}</div>
              <p className="mb-1 font-semibold text-[#F5F5F4]">{archetype.name}</p>
              <p className="text-sm text-[#A1A19E]">{archetype.headline}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
