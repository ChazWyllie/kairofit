import { ImageResponse } from 'next/og'

type MarketingOgImageProps = {
  eyebrow: string
  title: string
  subtitle: string
}

export function createMarketingOgImage({ eyebrow, title, subtitle }: MarketingOgImageProps) {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0A0A0B',
        color: '#F5F5F4',
        padding: '72px',
        fontFamily: 'sans-serif',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          opacity: 0.45,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '-140px',
          bottom: '-140px',
          height: '380px',
          width: '380px',
          borderRadius: '999px',
          background: 'rgba(202,255,76,0.14)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ letterSpacing: '0.28em', fontSize: 24, fontWeight: 700 }}>KAIROFIT</div>
        <div
          style={{
            fontSize: 18,
            color: '#CAFF4C',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          maxWidth: '860px',
        }}
      >
        <div style={{ fontSize: 82, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-0.05em' }}>
          {title}
        </div>
        <div style={{ fontSize: 28, lineHeight: 1.45, color: '#A1A19E' }}>{subtitle}</div>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          {['Closed beta', 'Research-backed', 'Adaptive AI'].map((item) => (
            <div
              key={item}
              style={{
                border: '1px solid #1F1F23',
                borderRadius: 999,
                padding: '10px 16px',
                fontSize: 16,
                color: '#6B6B68',
              }}
            >
              {item}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 18, color: '#CAFF4C' }}>kairofitdev.vercel.app</div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
