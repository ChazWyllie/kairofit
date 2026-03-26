# FitBod Onboarding Audit - "Build Your Personalized Plan"

Source: Claude Google extension audit of fitbod.me onboarding flow.
Purpose: Inform KairoFit onboarding design. Do not copy this flow - improve it.
Original raw audit: FITBOD_ONBOARDING_AUDIT_RAW.md

---

## The 31-Screen Flow

FitBod collects 14 data signals across 31 screens before asking for an email.
11 of those screens are interstitials (social proof, testimonials, feature showcases).
The email gate is at screen 31 - the very last screen.

### Phase 1: Demographics (screens 1-3)

Screen 1 - Age (/home/)
Question: "How old are you?"
Options: 18-23 | 24-29 | 30s | 40s | 50+
Interaction: single select, auto-advance

Screen 2 - Gender (/gender/)
Question: "What's your gender?"
Sub-copy: "Biological and societal factors influence training needs."
Options: Male | Female | Non-binary | Prefer not to say

Screen 3 - Personalized Social Proof Interstitial (/rtb_age_gender/)
NOT a question. Trust-building screen.
Headline: "Over 316,000 men in their 30s have improved their health and fitness with Fitbod."
The number changes dynamically based on age + gender selected.

### Phase 1 (continued): Motivation and Attribution (screens 4-5)

Screen 4 - Motivator (/motivation/)
"What is your biggest motivator?"
Options: Feel more confident | More energy | Reduce aches | Stay healthy | Other

Screen 5 - HDYHAU (/hdyhau/)
"How did you hear about Fitbod?"
Options: Internet search | Friend/Family | Social Media | Other
FLAW: Mid-quiz marketing attribution. Breaks user-centric tone. KairoFit moves to post-signup.

### Phase 1: Fitness Goal (screens 6-8)

Screen 6 - Main Goal (/fitness_goal/)
"What's your main goal?"
Options (with emoji): Gain muscle | Lose weight | Lose fat and gain muscle | Improve overall fitness

Screen 7 - Goal Social Proof Interstitial (/rtb-goal-social-proof/)
"Fitbod has helped over 1.6M people build muscle and get stronger."

Screen 8 - Testimonial (/rtb-review-1/)
"Life changing" 5-star review.
Highlighted metric: "I've lost 32 kilos in just 1.5 years with 3 workouts per week."

### Phase 1: Training Experience and Habits (screens 9-13)

Screen 9 - Training Experience (/experience/)
"How experienced are you with strength training?"
Options: Just starting out | Comfortable on my own | Experienced
FLAW: Only 3 levels, no intermediate. KairoFit uses 5 behavioral levels.

Screen 10 - Experience Social Proof (/rtb-experience/)
"38% of people who join Fitbod are comfortable on their own but looking for more guidance."

Screen 11 - Biggest Challenge (/obstacle/)
Options: Lack of motivation | Not knowing what to do | Busy schedule | None of the above

Screen 12 - Recent Workout Frequency (/fitness_habit/)
Options: Several times per week | A few times per month | Once or twice | I don't workout

Screen 13 - Empathy Interstitial (/rtb-obstacle/)
"You're on the right track" - uses age + gender + obstacle for personalized copy.

### Phase 1: Psychographic Profiling (screens 14-18)

Screen 14 - Statement 1 (/progress/)
"Seeing my progress each week keeps me motivated."
Options: Agree / Disagree only
FLAW: Binary Agree/Disagree loses nuance. KairoFit uses 1-5 scale.

Screen 15 - Statement 2 (/push/)
"I love when my workouts challenge me more each time."

Screen 16 - Statement 3 (/engage/)
"Repeating the same workouts gets boring fast."

Screen 17 - Statement 4 (/form/)
"Clear guidance on form helps me feel confident in the gym."

Screen 18 - Behavioral Profile Reveal (/rtb-profile/)
Header: "YOUR BEHAVIORAL PROFILE"
Assigned archetype: "The Milestone Chaser" (based on 4 Agree/Disagree answers)
This is the emotional peak of the funnel. Commitment forms here.
FLAW: Email gate is still 13 screens away. KairoFit gates immediately after this.

### Phase 2: Schedule and Lifestyle (screens 19-23)

Screen 19 - Days Per Week (/days/)
Options: 2 | 3 | 4 | 5 | 6 days

Screen 20 - Workout Duration (/duration/)
Options: 15 min | 30 min | 45 min | 60+ min
FLAW: Stores bare integer. "60+" and "60 minutes" mean different things for session planning.

Screen 21 - Work Schedule (/work/)
Options: 9-5 | Shift work | Flexible | Retired/Not working

Screen 22 - Daily Activity Level (/activity/)
Options: Mostly sitting | On my feet | Mix | Varies

Screen 23 - Sleep (/sleep/)
Options: <5 hrs | 5-6 hrs | 7-8 hrs | >8 hrs

### Phase 3: Training Setup (screens 24-29)

Screen 24 - Other Training Types (/other_training/) MULTI-SELECT
None | Cardio/endurance | Sports | Yoga/Mobility | Pilates | Other

Screen 25 - Equipment (/equipment/) MULTI-SELECT
Dumbbells or kettlebells | Barbells | Machines or cables | Resistance bands | Bench | No equipment
FLAW: Groups dumbbells and kettlebells together. KairoFit separates them.
FLAW: "Squat rack" is absent despite being a distinct and common piece of equipment.

Screen 26 - Equipment Feature Interstitial (/rtb-equipment/)
Feature showcase with app screenshots.

Screen 27 - Testimonial (/rtb-review-3/)
"Keeps me on track" - highlights equipment flexibility.

Screen 28 - Training Split Preference (/muscle_split/)
Options: Push/Pull/Legs | Upper/Lower | Full Body | I'm not sure

Screen 29 - Testimonial (/rtb-review-4/)
"Better results than a personal trainer"

### Phase 4: Conversion Gate (screens 30-31)

Screen 30 - Fake Loading Screen (/rtb-loader/)
"Just a moment while we build your first workout"
4 animated bars completing in sequence. ~4 seconds. No content.
FLAW: 4 wasted engagement seconds. KairoFit shows real-time program preview instead.

Screen 31 - Email Gate (/email/)
"Your results are almost ready!"
FLAW: Screen 31 of 31. Users who drop off between screens 18-31 are completely lost.
KairoFit gates at screen 16, immediately after the archetype reveal (screen 15).

---

## Data Points FitBod Collects

1. Age range
2. Gender
3. Primary motivator (psychographic)
4. Marketing attribution (HDYHAU)
5. Main fitness goal
6. Training experience level
7. Biggest challenge
8. Recent workout frequency
9. Psychographic battery (4 agree/disagree statements)
10. Days per week
11. Session duration preference
12. Work schedule
13. Daily activity level (NEAT estimate)
14. Sleep duration
15. Other training types
16. Available equipment
17. Preferred training split

## Additional Data Points KairoFit Collects (FitBod does not)

18. Height + weight (for timeline projection and load estimation)
19. Injury zones (lower back, knees, shoulders, wrists, hips, neck)
20. "Why now?" urgency trigger
21. Desired goal timeline (shown as projected weeks in loading screen)
22. Preferred workout time (for notification scheduling)
23. Explicit units preference (kg vs lbs)

---

## The 15 Gaps KairoFit Exploits

### Gap 1 - No Body Composition Data

FitBod never asks height, weight, or body fat.
KairoFit uses this for projected transformation timeline:
"At 4 days/week, expect visible strength gains in 8-10 weeks."

### Gap 2 - No Injury Screening

Zero questions about injuries, chronic pain, or limitations.
KairoFit screens for 6 injury zones and auto-excludes contraindicated exercises.
This is a trust, safety, and retention differentiator for users 30+.

### Gap 3 - HDYHAU Attribution Mid-Quiz

Marketing data collection inserted after just 4 screens. Breaks the user-centric tone.
KairoFit moves this to post-signup settings.

### Gap 4 - Binary Agree/Disagree is Low-Resolution

Binary choices produce 4-5 archetypes. A 1-5 scale enables 8+ archetypes.
KairoFit uses a 5-point scale for richer psychographic segmentation.

### Gap 5 - No Nutrition Bridge

Zero mention of nutrition. KairoFit scaffolds macro targets (post-MVP).

### Gap 6 - Fake Loading Screen Wastes Engagement

4 seconds of animation. No personalized content.
KairoFit shows: research fact + projected timeline + live program preview simultaneously.

### Gap 7 - Email Gate at Screen 31

13 screens after the emotional peak (archetype reveal at screen 18).
Every drop-off between 18-31 is a lost lead.
KairoFit gates immediately after the archetype reveal. Screen 16 of 22.

### Gap 8 - Anonymous Testimonials

Usernames only. No photos, no platform attribution.
KairoFit uses verified App Store rating counts and highlighted specific metrics.

### Gap 9 - No Preferred Workout Time

No question about morning vs evening preference.
Affects notification timing, warm-up recommendations, and user perception of personalization.

### Gap 10 - No "Why Now?" Urgency Question

What triggered this decision today?
KairoFit captures this and uses it to frame the program with urgency and specificity.

### Gap 11 - No Desired Timeline

FitBod never shows a projected results timeline.
KairoFit shows a timeline chart during program generation.

### Gap 12 - No Step Count in Progress Bar

4-segment bar with no indication of total screens.
Users get quiz fatigue around screen 15 with no end in sight.
KairoFit shows "Step X of 22" throughout.

### Gap 13 - Three Inconsistent Navigation Bars

Main site, exercises section, and blog all have different navbars.
KairoFit has one global navigation component everywhere.

### Gap 14 - No Intermediate Level

Workout generator only has Beginner and Advanced.
The majority of users are intermediate.
KairoFit uses 5 levels with behavioral descriptions.

### Gap 15 - Equipment Single-Select

Cannot pick dumbbells AND barbells together.
Real gyms and home setups mix equipment.
KairoFit always multi-selects equipment with "Squat rack" as a separate option.
