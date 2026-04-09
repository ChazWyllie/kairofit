const steps = [
  {
    number: '01',
    title: '5-minute intake quiz',
    description:
      'Answer questions about your experience level, available equipment, schedule, and goals. Kiro uses this to calibrate volume, intensity, and split selection - not to generate a template.',
  },
  {
    number: '02',
    title: 'Kiro builds your program',
    description:
      'Claude analyzes your intake and applies exercise science principles: progressive overload, recovery windows, muscle balance, and contraindication matching. The result is a program built for you, with every choice explained.',
  },
  {
    number: '03',
    title: 'Train with context',
    description:
      'Each session shows your target sets, reps, and weight - plus the next-session target computed from your actual performance. Kiro adapts volume weekly based on how your body is responding.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#6366F1]">
            How it works
          </p>
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#F5F5F4] sm:text-5xl">
            From intake to first rep.
          </h2>
          <p className="text-lg text-[#A1A19E]">
            No templates. No one-size-fits-all splits. Your program is generated fresh from your
            data every time.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line - desktop only */}
          <div
            aria-hidden
            className="absolute left-[calc(2.5rem-1px)] top-10 hidden h-[calc(100%-5rem)] w-px bg-gradient-to-b from-[#6366F1]/40 via-[#6366F1]/20 to-transparent sm:block lg:left-[calc(50%-1px)] lg:top-auto lg:h-px lg:w-[calc(100%-10rem)] lg:bg-gradient-to-r"
          />

          <div className="space-y-12 lg:grid lg:grid-cols-3 lg:gap-10 lg:space-y-0">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5 lg:flex-col lg:gap-4">
                {/* Step number badge */}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6366F1] text-xs font-bold text-white">
                  {step.number}
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-semibold text-[#F5F5F4]">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[#A1A19E]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
