import Link from 'next/link'

export function LandingCTA() {
  return (
    <section className="px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-tight text-[#F5F5F4] sm:text-5xl">
          Start with a 5-minute quiz.
          <br />
          <span className="text-[#6366F1]">Walk into the gym with a reason.</span>
        </h2>
        <p className="mx-auto mb-10 max-w-xl text-lg text-[#A1A19E]">
          Kiro builds your program from your data and the literature. Free during beta. No credit
          card. Works offline at the gym.
        </p>

        <Link
          href="/onboarding"
          className="inline-block rounded-xl bg-[#6366F1] px-10 py-4 text-base font-semibold text-white transition-colors hover:bg-[#5558E6]"
        >
          Build my program - free
        </Link>

        <p className="mt-4 text-xs text-[#6B6B68]">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[#A1A19E] underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  )
}
