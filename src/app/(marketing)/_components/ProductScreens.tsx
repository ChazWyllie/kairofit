'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { PhoneFrame } from './PhoneFrame'

export type ScreenName =
  | 'today'
  | 'log'
  | 'chat'
  | 'insights'
  | 'missed'
  | 'recovery'
  | 'travel'
  | 'injury'
  | 'debrief'

const transitions = {
  initial: { opacity: 0, y: 12, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 1.01 },
}

export function ProductScreen({ screen }: { screen: ScreenName }) {
  const reduceMotion = useReducedMotion()
  const motionProps = reduceMotion
    ? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : transitions

  return (
    <PhoneFrame>
      <div className="relative overflow-hidden bg-marketing-bg-tint p-4 text-marketing-text-primary">
        <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(202,255,76,0.18),transparent_72%)]" />
        <div className="relative z-10 min-h-[620px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen}
              initial={motionProps.initial}
              animate={motionProps.animate}
              exit={motionProps.exit}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: 'easeOut' }}
            >
              {screen === 'today' && <TodayScreen />}
              {screen === 'log' && <QuickLogScreen />}
              {screen === 'chat' && <ChatScreen />}
              {screen === 'insights' && <InsightsScreen />}
              {screen === 'missed' && <MissedScreen />}
              {screen === 'recovery' && <RecoveryScreen />}
              {screen === 'travel' && <TravelScreen />}
              {screen === 'injury' && <InjuryScreen />}
              {screen === 'debrief' && <DebriefScreen />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PhoneFrame>
  )
}

function ScreenTop({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-text-muted">
          KairoFit // Today
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{title}</h3>
        <p className="mt-2 max-w-[240px] text-sm leading-6 text-marketing-text-secondary">
          {subtitle}
        </p>
      </div>
      <div className="rounded-full border border-marketing-border-strong bg-marketing-surface-raised px-3 py-1 font-mono text-mono-label-xs text-marketing-accent">
        Active
      </div>
    </div>
  )
}

function Surface({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-marketing-border bg-marketing-surface p-4">
      {children}
    </div>
  )
}

function TodayScreen() {
  return (
    <div>
      <ScreenTop title="Good morning." subtitle="How are you feeling before we build today?" />
      <Surface>
        <div className="grid grid-cols-2 gap-3">
          {['Tired', 'Okay', 'Ready', 'Fired up'].map((state, index) => (
            <button
              key={state}
              className={`rounded-[18px] border px-4 py-5 text-left text-sm ${
                index === 2
                  ? 'border-marketing-accent bg-marketing-accent-tint text-marketing-text-primary'
                  : 'border-marketing-border bg-marketing-bg-layer text-marketing-text-secondary'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </Surface>
      <div className="mt-4 grid gap-4">
        <Surface>
          <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-text-muted">
            Nutrition today
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Metric label="Protein" value="160g" />
            <Metric label="Meals left" value="2" />
            <Metric label="Water" value="3.0L" />
          </div>
        </Surface>
        <Surface>
          <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-text-muted">
            Workout options
          </p>
          <div className="mt-4 space-y-3">
            <WorkoutOption title="30-min Push Day" meta="Full gym // Upper body" selected />
            <WorkoutOption title="45-min Full Body" meta="Moderate intensity" />
          </div>
        </Surface>
      </div>
    </div>
  )
}

function QuickLogScreen() {
  return (
    <div>
      <ScreenTop title="Quick log" subtitle="30 seconds. Confirm or tap to adjust." />
      <Surface>
        <div className="space-y-3">
          {[
            ['Workout completed', 'No'],
            ['Protein target hit', 'Almost'],
            ['Steps', '8,420'],
            ['Water', '2.7L'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between rounded-[18px] border border-marketing-border bg-marketing-bg-tint px-4 py-3"
            >
              <span className="text-sm text-marketing-text-primary">{label}</span>
              <span className="font-mono text-sm text-marketing-accent">{value}</span>
            </div>
          ))}
        </div>
      </Surface>
      <div className="mt-4 rounded-[24px] border border-marketing-accent-outline bg-marketing-accent-tint p-4 text-sm leading-6 text-marketing-text-primary">
        Tap <span className="font-semibold">I missed</span> if the session did not happen. Tomorrow
        adapts automatically.
      </div>
    </div>
  )
}

function ChatScreen() {
  return (
    <div>
      <ScreenTop title="Kiro" subtitle="Direct answers. Real programming logic." />
      <div className="space-y-3">
        <Bubble align="right">Why is chest volume only 12 sets this week?</Bubble>
        <Bubble align="left">
          You are ramping from MEV after your deload. Two weeks from now you will be at 16. Twelve
          is the right dose for this week.
        </Bubble>
        <Bubble align="right">Can I swap if my shoulder feels off?</Bubble>
        <Bubble align="left">
          Yes. Toggle the shoulder flare-up and I will replace overhead pressing with landmine press
          and cable work.
        </Bubble>
      </div>
    </div>
  )
}

function InsightsScreen() {
  return (
    <div>
      <ScreenTop title="Insights" subtitle="What changed this week, and what still counts." />
      <div className="grid gap-4">
        <Surface>
          <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-text-muted">
            Week score
          </p>
          <div className="mt-4 flex items-end justify-between">
            <div className="font-mono text-5xl tracking-[-0.04em] text-marketing-accent">84</div>
            <p className="max-w-[160px] text-right text-sm leading-6 text-marketing-text-secondary">
              Four workouts completed. Protein averaged 152g.
            </p>
          </div>
        </Surface>
        <Surface>
          <div className="grid grid-cols-4 gap-3">
            {[72, 81, 66, 84].map((score, index) => (
              <div key={score} className="rounded-[18px] bg-marketing-bg-layer p-3 text-center">
                <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-text-muted">
                  W{index + 1}
                </p>
                <p className="mt-3 font-mono text-xl text-marketing-text-primary">{score}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>
    </div>
  )
}

function MissedScreen() {
  return (
    <div>
      <ScreenTop title="Missed day logged" subtitle="The week stays intact." />
      <Surface>
        <div className="rounded-[20px] border border-marketing-accent-outline bg-marketing-accent-tint p-4">
          <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-accent">
            Action
          </p>
          <p className="mt-3 text-base font-medium">Tuesday session marked as missed</p>
          <p className="mt-2 text-sm leading-6 text-marketing-text-secondary">
            Pulling volume moved to Thursday and Saturday. Weekly back volume still lands at 14
            sets.
          </p>
        </div>
      </Surface>
    </div>
  )
}

function RecoveryScreen() {
  return (
    <div>
      <ScreenTop title="Readiness adjusted" subtitle="Bad sleep changes the dose, not the habit." />
      <div className="grid gap-4">
        <Surface>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-marketing-text-secondary">Sleep</p>
              <p className="mt-2 font-mono text-3xl text-marketing-text-primary">5h 04m</p>
            </div>
            <div>
              <p className="text-sm text-marketing-text-secondary">Stress</p>
              <p className="mt-2 font-mono text-3xl text-marketing-accent">High</p>
            </div>
          </div>
        </Surface>
        <Surface>
          <p className="text-sm text-marketing-text-primary">
            Workout shortened from 45 minutes to 30 minutes.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-marketing-text-secondary">
            <div className="rounded-[18px] bg-marketing-bg-tint p-3">Primary compounds kept</div>
            <div className="rounded-[18px] bg-marketing-bg-tint p-3">Accessory volume reduced</div>
          </div>
        </Surface>
      </div>
    </div>
  )
}

function TravelScreen() {
  return (
    <div>
      <ScreenTop title="Travel mode" subtitle="The plan rebuilds around what exists today." />
      <Surface>
        <div className="grid grid-cols-2 gap-3">
          {['Bodyweight', 'Bands', 'Hotel dumbbells', 'Full gym'].map((item, index) => (
            <div
              key={item}
              className={`rounded-[18px] border px-4 py-4 text-sm ${
                index === 0
                  ? 'border-marketing-accent bg-marketing-accent-tint text-marketing-text-primary'
                  : 'border-marketing-border bg-marketing-bg-tint text-marketing-text-secondary'
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      </Surface>
      <div className="mt-4 space-y-3">
        <WorkoutOption title="Split squat" meta="3 x 10 each side" selected />
        <WorkoutOption title="Band row" meta="4 x 12" />
        <WorkoutOption title="Push-up cluster" meta="5 x 8" />
      </div>
    </div>
  )
}

function InjuryScreen() {
  return (
    <div>
      <ScreenTop
        title="Flare-up handled"
        subtitle="Lower back symptoms change the exercise pool first."
      />
      <Surface>
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <Zone label="Lower back" active />
          <Zone label="Shoulders" />
          <Zone label="Knees" />
        </div>
      </Surface>
      <div className="mt-4 space-y-3">
        <WorkoutOption title="Hip thrust" meta="Substituted for RDL" selected />
        <WorkoutOption title="Split squat" meta="Upright torso bias" />
        <WorkoutOption title="Cable row" meta="Low spinal loading" />
      </div>
    </div>
  )
}

function DebriefScreen() {
  return (
    <div>
      <ScreenTop title="Weekly debrief" subtitle="The loop closes with targets, not fluff." />
      <Surface>
        <p className="text-sm leading-7 text-marketing-text-primary">
          Bench moved well at 72.5 kg for 8, 8, and 7. Keep the load next week and chase 8 on the
          third set before adding weight. Hamstring volume held at 12 sets because sleep averaged 6
          hours this week.
        </p>
      </Surface>
    </div>
  )
}

function WorkoutOption({
  title,
  meta,
  selected = false,
}: {
  title: string
  meta: string
  selected?: boolean
}) {
  return (
    <div
      className={`rounded-[20px] border px-4 py-4 ${
        selected
          ? 'border-marketing-accent-outline bg-marketing-accent-tint'
          : 'border-marketing-border bg-marketing-surface'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-base font-medium text-marketing-text-primary">{title}</p>
          <p className="mt-1 text-sm text-marketing-text-secondary">{meta}</p>
        </div>
        {selected && (
          <span className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-accent">
            Selected
          </span>
        )}
      </div>
    </div>
  )
}

function Bubble({ align, children }: { align: 'left' | 'right'; children: React.ReactNode }) {
  return (
    <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-[24px] px-4 py-3 text-sm leading-6 ${
          align === 'right'
            ? 'bg-marketing-accent text-marketing-accent-on'
            : 'border border-marketing-border bg-marketing-surface text-marketing-text-primary'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-marketing-bg-tint p-3">
      <p className="font-mono text-mono-label-xs uppercase tracking-[0.18em] text-marketing-text-muted">
        {label}
      </p>
      <p className="mt-3 font-mono text-xl text-marketing-text-primary">{value}</p>
    </div>
  )
}

function Zone({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div
      className={`rounded-[18px] border px-3 py-4 ${
        active
          ? 'border-marketing-accent-outline bg-marketing-accent-tint text-marketing-text-primary'
          : 'border-marketing-border bg-marketing-bg-tint text-marketing-text-secondary'
      }`}
    >
      {label}
    </div>
  )
}
