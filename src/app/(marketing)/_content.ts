export const marqueeItems = [
  'Closed beta',
  'Built on 50+ peer-reviewed studies',
  'Adapts to your week, not the other way around',
  '30-second daily logging',
  'Travel mode built in',
  'Injury-aware programming',
  'No rigid 12-week programs',
  'Consistency beats perfection',
  'One AI coach, not a library of generic plans',
] as const

export const heroFloatingStats = [
  { label: '11 day streak', detail: 'Streak preserved through travel week' },
  { label: 'Workouts 4/5', detail: 'Weekly target still on track' },
] as const

export const adaptationPillars = [
  {
    number: '01',
    title: 'You miss a day',
    body: 'Log "I missed" in one tap. No guilt spiral, no program reset. Tomorrow\'s plan quietly absorbs what happened and keeps you moving forward. Consistency compounds; perfection does not.',
    citation: 'Behavioral adherence patterns',
    citationHref: '/science#adaptive-vs-rigid',
    screen: 'missed',
  },
  {
    number: '02',
    title: 'Bad week, bad sleep, high stress',
    body: "Your morning check-in captures how you actually feel. Slept 5 hours? Stress high? Kairo shortens today's workout, prioritizes recovery work, and quietly drops the accessory volume you will not benefit from anyway.",
    citation: 'SRA and fatigue management',
    citationHref: '/science#adaptive-session-management',
    screen: 'recovery',
  },
  {
    number: '03',
    title: 'You are traveling, or the gym is closed',
    body: 'Hit Travel Mode or tell Kairo what equipment you have today. Hotel room with a resistance band? Bodyweight only? Your plan rebuilds itself around what is actually available, not what your profile says you own.',
    citation: 'Equipment-aware programming',
    citationHref: '/science#adaptive-session-management',
    screen: 'travel',
  },
  {
    number: '04',
    title: 'An old injury flares up',
    body: 'Tap the affected area. Kairo excludes contraindicated exercises, substitutes safer alternatives, and Kiro explains exactly why each swap was made. This is the FitBod gap. No injury screening, ever. KairoFit is built around it.',
    citation: 'Contraindication system',
    citationHref: '/science#injury-screening',
    screen: 'injury',
  },
] as const

export const kiroExamples = [
  {
    user: 'Why is my chest volume only 12 sets this week? I thought more was better.',
    kiro: 'You are at level 3, intermediate. Optimal chest volume for your level is 14 to 16 sets per week at MAV. You are at 12 because you are ramping from MEV after your last deload. Two weeks from now you will be at 16. Going higher than that this week would fatigue faster than you would grow. The curve matters more than the number.',
  },
  {
    user: 'My lower back is flaring up. Why did you swap Romanian deadlifts out?',
    kiro: 'You flagged lower back irritation this morning. Romanian deadlifts stay in when your symptoms are quiet, but not when spinal loading is the risk. Today shifts you to hip thrusts and split squats so your hamstrings still get 10 direct sets this week without loading the area that is aggravated.',
  },
  {
    user: 'I missed Tuesday. Did I ruin the week?',
    kiro: "No. Tuesday's pulling volume moved into Thursday and Saturday so your back still lands at 14 weekly sets. The week stays intact because the target is weekly stimulus, not perfect calendar compliance.",
  },
] as const

export const scienceCards = [
  {
    id: 'volume-landmarks',
    citation: 'Schoenfeld et al., 2017 // Israetel volume landmarks',
    title: 'Volume landmarks',
    body: 'KairoFit uses MEV, MAV, and MRV to decide how much work you can use. Beginners start lower. Intermediate and advanced lifters ramp higher only when recovery and adherence justify it.',
    footer:
      'What this means in the app: your weekly set targets are level-specific and phase-specific.',
  },
  {
    id: 'rep-range-equivalence',
    citation: 'Schoenfeld et al., 2019 // Plotkin et al., 2022',
    title: 'Rep range equivalence',
    body: 'Hypertrophy shows up across roughly 5 to 30 reps when proximity to failure is matched. KairoFit uses rep ranges as tools for progression, fatigue control, and equipment constraints.',
    footer:
      'What this means in the app: bodyweight, bands, and gym equipment can all still drive growth.',
  },
  {
    id: 'rest-periods',
    citation: 'Schoenfeld et al., 2016',
    title: 'Rest periods',
    body: 'The 3-minute rest group produced 13.1% quad growth versus 6.8% with 1-minute rest. Heavy compounds need more recovery if performance quality is the goal.',
    footer:
      'What this means in the app: compounds stay at 120 to 180 seconds instead of rushed timer defaults.',
  },
  {
    id: 'periodization-over-rotation',
    citation: 'Ramos-Campo et al., 2024',
    title: 'Periodization over rotation',
    body: 'Split choice matters less than equated volume. What matters is structured progression, fatigue management, and planned deloads instead of random workout churn.',
    footer: 'What this means in the app: KairoFit programs blocks, not just daily novelty.',
  },
  {
    id: 'injury-screening',
    citation: 'KairoFit contraindication system',
    title: 'Injury screening',
    body: 'Six injury zones are screened up front, then rechecked when symptoms flare. Unsafe movements are filtered before they enter the plan, not after they cause a bad session.',
    footer: 'What this means in the app: substitutions are proactive, not reactive.',
  },
  {
    id: 'adaptive-vs-rigid',
    citation: 'Retention research context // Baz-Valle et al., 2022',
    title: 'Adaptive beats rigid',
    body: 'A rigid plan fails the moment life changes. Adaptive systems protect consistency, which is the variable that compounds over months instead of collapsing after one bad week.',
    footer: 'What this means in the app: your week bends without breaking.',
  },
] as const

export const comparisonRows = [
  {
    fitbod: 'No injury screening. You tell them you have a bad shoulder? They do not care.',
    kairofit: '6 injury zones, screened at onboarding. Contraindicated exercises auto-excluded.',
  },
  {
    fitbod: 'No body composition. Height, weight, and body fat all unasked.',
    kairofit: 'Height, weight, and goal used to project your actual timeline.',
  },
  {
    fitbod: 'Fatigue rotation dressed up as programming.',
    kairofit: 'Real mesocycles. Scheduled deloads. Progressive overload, not shuffled volume.',
  },
  {
    fitbod: '3 experience levels: Beginner, Advanced, or figure it out.',
    kairofit: '5 levels with behavioral descriptions. No one slips between the cracks.',
  },
  {
    fitbod: 'Email gate at screen 31 after 30 screens of fake loading.',
    kairofit: 'Email gate at screen 16, right after your archetype reveal. We respect your time.',
  },
  {
    fitbod: '$15.99/month. Opaque algorithm.',
    kairofit: 'Free during beta. $9.99/month at launch. Kiro explains every decision.',
  },
] as const

export const founderCredentials = [
  'CS @ ASU',
  'Powerhouse Fitness alumni',
  'Built KairoFit from scratch',
] as const

export const sciencePageSections = [
  {
    id: 'volume-landmarks',
    title: 'How we decide volume',
    citation: 'Schoenfeld et al., 2017 // Israetel volume landmarks',
    body: [
      'Volume is the first programming lever KairoFit takes seriously. We use minimum effective volume, maximum adaptive volume, and recoverable ceilings to set weekly targets that make sense for your experience level, your schedule, and the phase you are in.',
      'A beginner does not need the same weekly dose as an advanced lifter. KairoFit starts conservatively, then climbs when your adherence and recovery support it. The point is not to impress you with a big number. The point is to give you the smallest amount of work that still moves you forward, then scale with evidence.',
    ],
  },
  {
    id: 'rep-range-equivalence',
    title: 'How we decide rep ranges',
    citation: 'Schoenfeld et al., 2019 // Plotkin et al., 2022',
    body: [
      'Hypertrophy can happen across a wide rep range when effort is matched. That lets KairoFit adapt intelligently when your equipment changes or when a joint-friendly substitution makes more sense than forcing the textbook movement.',
      'Heavy loading still matters for strength. Moderate loading remains efficient for hypertrophy. Higher-rep work becomes useful when equipment is limited, fatigue is high, or joint comfort matters more than chasing another plate on the bar.',
    ],
  },
  {
    id: 'rest-periods',
    title: 'How we decide rest periods',
    citation: 'Schoenfeld et al., 2016',
    body: [
      'Short rest feels intense, but intensity is not the same thing as productive output. The often-cited quad hypertrophy comparison of 13.1% versus 6.8% is why KairoFit does not rush heavy compound work just to make the interface feel busy.',
      'Compounds stay at 120 seconds minimum. Isolation work lives in the 60 to 90 second window. Rest is prescribed to support output quality, not to punish you for taking a breath.',
    ],
  },
  {
    id: 'adaptive-session-management',
    title: 'How we adapt between sessions',
    citation: 'Recovery curves, SRA logic, adherence research',
    body: [
      'Your morning check-in matters because readiness is not theoretical. Sleep, stress, time available, travel, and missed sessions all change what you can actually benefit from today.',
      'KairoFit uses those signals to shorten sessions, trim accessory volume, switch equipment profiles, or absorb missed work later in the week. The objective is not a perfect training diary. The objective is sustainable forward motion.',
    ],
  },
  {
    id: 'injury-screening',
    title: 'How we screen for injuries',
    citation: 'KairoFit contraindication matrix',
    body: [
      'Lower back, knees, shoulders, wrists, hips, and neck are screened before programming begins. Each zone maps to excluded movements, cautionary modifications, and safer substitutes.',
      'That makes injury-awareness a first-class programming constraint rather than an afterthought. When a flare-up happens, your plan changes before it can ask you to do something reckless.',
    ],
  },
  {
    id: 'deloads-periodization',
    title: 'How we handle deloads and periodization',
    citation: 'Ramos-Campo et al., 2024 // KairoFit programming rules',
    body: [
      'KairoFit uses scheduled deloads because fatigue management is part of progress, not a failure state. Intermediate lifters deload every 5 weeks by default, with volume reduced and intensity preserved.',
      'The point is to keep progression coherent over months. Random rotation can hide fatigue, but it does not replace actual periodization. We bias toward plans that explain where you are in the block and why the current dose exists.',
    ],
  },
  {
    id: 'bibliography',
    title: 'Our research bibliography',
    citation: 'Internal science documentation',
    body: [
      'Primary references include Schoenfeld et al. on volume, rep ranges, and rest periods; Plotkin et al. on hypertrophy equivalence; Ramos-Campo et al. on split comparisons; and the internal KairoFit contraindication matrix for injury-aware substitution logic.',
      'For the full rule set and the exact programming constraints Kiro follows, see docs/science/PROGRAMMING_RULES.md and docs/science/CONTRAINDICATIONS.md in the product repository.',
    ],
  },
] as const

export const tourSteps = [
  {
    eyebrow: 'Monday morning',
    title: 'Your check-in sets the tone.',
    body: 'Kairo asks how you actually feel before the app commits you to a plan. Energy, sleep, and schedule become inputs, not excuses.',
    screen: 'today',
  },
  {
    eyebrow: 'Tuesday',
    title: 'You are tired. The plan shortens.',
    body: 'Low sleep and high stress convert a 45-minute day into a 30-minute version that keeps the primary work and cuts what you are least likely to recover from.',
    screen: 'recovery',
  },
  {
    eyebrow: 'Wednesday',
    title: 'Travel mode steps in.',
    body: 'Hotel gym, resistance band, or bodyweight only: the session rebuilds around what is available instead of what your profile said last week.',
    screen: 'travel',
  },
  {
    eyebrow: 'Thursday',
    title: 'An old flare-up changes the exercise list.',
    body: 'Lower back symptoms trigger safer substitutions before the workout starts, with a clear explanation of what changed and why.',
    screen: 'injury',
  },
  {
    eyebrow: 'Friday',
    title: 'Kiro debriefs the week.',
    body: 'The app closes the loop with direct feedback: what moved well, what needs attention next time, and how the next week should progress.',
    screen: 'debrief',
  },
  {
    eyebrow: 'Saturday',
    title: 'Missed work gets absorbed, not punished.',
    body: 'A missed session is reallocated across the remaining week so the target stimulus still lands where it needs to.',
    screen: 'missed',
  },
  {
    eyebrow: 'Sunday',
    title: 'Recovery still counts as progress.',
    body: 'Rest days preserve the streak because consistency is the operating system. The app does not treat one quiet day as a broken chain.',
    screen: 'insights',
  },
] as const
