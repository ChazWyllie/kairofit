import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-[#F5F5F4]">
      <div className="max-w-md border border-[#1A1A1A] bg-[#0A0A0A] p-10 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#DC2626]">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
          Page not found
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#999999]">
          The page you requested does not exist or has moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center bg-[#DC2626] px-6 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#EF4444]"
        >
          Go home
        </Link>
      </div>
    </main>
  )
}
