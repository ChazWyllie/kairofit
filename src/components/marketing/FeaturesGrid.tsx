import { Brain, Activity, WifiOff, TrendingUp, BarChart2, ShieldAlert } from 'lucide-react'

const features = [
  {
    icon: <Brain className="h-5 w-5 text-[#6366F1]" />,
    title: 'AI Coach Kiro',
    description:
      'Named, direct, science-literate. Kiro explains every decision with specific numbers - not motivational phrases.',
  },
  {
    icon: <Activity className="h-5 w-5 text-[#F97316]" />,
    title: 'Recovery heatmap',
    description:
      'A 13-muscle visualization shows where you are in the SRA (stimulus, recovery, adaptation) curve after each session.',
  },
  {
    icon: <WifiOff className="h-5 w-5 text-[#10B981]" />,
    title: 'Offline-first',
    description:
      'Log sets without a network connection. Your data syncs in the background when you are back online. No lost reps.',
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-[#6366F1]" />,
    title: 'Progressive overload',
    description:
      'Next-session weight and rep targets are computed from your actual logged performance - not fixed percentages.',
  },
  {
    icon: <BarChart2 className="h-5 w-5 text-[#F97316]" />,
    title: 'Adaptive volume',
    description:
      'Weekly sets per muscle group adjust based on your experience level. Beginners cap at 16 sets. Level 5 athletes train up to 25.',
  },
  {
    icon: <ShieldAlert className="h-5 w-5 text-[#EF4444]" />,
    title: 'Injury-aware programming',
    description:
      'Your intake includes your full injury history. Kiro flags contraindicated movements and adapts exercise selection to keep you training safely while making progress.',
  },
]

export function FeaturesGrid() {
  return (
    <section className="bg-[#111113] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#6366F1]">
            Features
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#F5F5F4] sm:text-5xl">
            Built for serious training.
          </h2>
          <p className="text-lg text-[#A1A19E]">
            Every feature exists because it improves training outcomes - not to add complexity.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/5 bg-[#1A1A1F] p-6 transition-colors hover:border-white/10"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A0A0B]">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#F5F5F4]">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-[#A1A19E]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
