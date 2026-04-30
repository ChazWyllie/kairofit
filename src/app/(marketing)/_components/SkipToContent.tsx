interface SkipToContentProps {
  targetId?: string
}

export function SkipToContent({ targetId = 'main-content' }: SkipToContentProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-small focus:font-semibold focus:text-marketing-accent-on focus:outline-none focus:ring-2 focus:ring-marketing-accent focus:ring-offset-2 focus:ring-offset-marketing-bg"
    >
      Skip to content
    </a>
  )
}
