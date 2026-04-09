import { BookOpen, ChevronDown, FileText } from 'lucide-react'

const layers = [
  {
    icon: <BookOpen className="h-4 w-4 text-[#6366F1]" />,
    label: 'Layer 1',
    title: 'One-line rationale',
    description: 'Every exercise card shows a single sentence explaining why it is in your program.',
    example: 'Romanian deadlifts target hip-hinge mechanics and posterior chain hypertrophy at your current volume (12 sets/week).',
  },
  {
    icon: <FileText className="h-4 w-4 text-[#F97316]" />,
    label: 'Layer 2',
    title: 'Full program rationale',
    description: 'Your program overview contains a detailed paragraph from Kiro explaining the entire training block.',
    example: 'This 4-day upper/lower split is built around your intermediate experience (level 3) and 3-hour weekly availability. Volume is set at 14 working sets per muscle group - within the maximum adaptive range for your level...',
  },
  {
    icon: <ChevronDown className="h-4 w-4 text-[#10B981]" />,
    label: 'Layer 3',
    title: 'Research notes',
    description: 'Expand any exercise to read the full science behind the selection - study references included.',
    example: 'Schoenfeld (2010) established that mechanical tension is the primary driver of hypertrophy. This exercise creates peak tension in the 60-120 degree range of hip flexion...',
  },
]

export function ScienceHookSection() {
  return (
    <section className="bg-[#111113] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#6366F1]">
            Science transparency
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#F5F5F4] sm:text-5xl">
            Know why every rep.
          </h2>
          <p className="text-lg text-[#A1A19E]">
            Most apps give you exercises. Kiro gives you exercises and the research behind them.
            Three layers of transparency, from a single sentence to the full study reference.
          </p>
        </div>

        {/* Layer cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {layers.map((layer) => (
            <div
              key={layer.label}
              className="rounded-2xl border border-white/5 bg-[#1A1A1F] p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                {layer.icon}
                <span className="text-xs font-medium text-[#6B6B68]">{layer.label}</span>
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#F5F5F4]">{layer.title}</h3>
              <p className="mb-4 text-sm leading-relaxed text-[#A1A19E]">{layer.description}</p>
              {/* Mock example */}
              <div className="rounded-lg border border-white/5 bg-[#0A0A0B] p-3">
                <p className="text-xs italic leading-relaxed text-[#6B6B68]">
                  &ldquo;{layer.example}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
