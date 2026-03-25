# FitBod Navigation Audit - fitbod.me

Source: Claude Google extension audit of fitbod.me navigation.
Purpose: Identify UX patterns to replicate and gaps to exploit in KairoFit.
Original raw audit: FITBOD_NAV_AUDIT_RAW.md

---

## FitBod's Three Inconsistent Navigation Bars

### Main Homepage (fitbod.me)
FAQs | Articles (dropdown) | Workouts | Exercises | Help | Log In | More (dropdown) | [Try Fitbod]

Articles dropdown: All Articles, Training, Nutrition, Cardio, Product
More dropdown: Customer Stories, Shop, Careers, Contact Us, For Business
CTA: "Try Fitbod" - red/pink pill button

### Exercise Sub-section (fitbod.me/exercises)
Articles | Workouts | Exercises | Help | Account | [Try Free]
"Log In" becomes "Account". FAQs disappears. More dropdown disappears.

### Blog (fitbod.me/blog)
[FITBOD Blog logo] ... Workouts | Exercises | Training (dropdown) | Nutrition (dropdown) | Cardio (dropdown) | Podcast | Product | Fitbod.me | [Try Fitbod]
Uses "FITBOD Blog" wordmark instead of main logo.

### The Core UX Problem
Three different navigation bars across three sections of the same product.
Users lose orientation when moving between sections.
KairoFit rule: ONE global navigation component used everywhere with no variation.

---

## FitBod Exercises Page (fitbod.me/exercises)

### Content Structure
1. "Explore by Muscle Groups" carousel (15 muscle groups with anatomical diagrams)
2. "Explore by Equipment" carousel (16 equipment items with product photos)
3. "The Top 10 Most Popular Exercises" with Rank By dropdown

### Top 10 Exercises by Popularity (actual set counts from audit)
1. Dumbbell Bicep Curl - 11,988,008 sets - mSCORE: 99.6
2. Hammer Curls - 10,391,123 sets - mSCORE: 99.2
3. Dumbbell Row - 10,105,842 sets - mSCORE: 99.9
4. Dumbbell Bench Press - 10,009,222 sets - mSCORE: 99.7
5. Lat Pulldown - 9,684,781 sets - mSCORE: 100
6. Barbell Bench Press - 8,702,771 sets - mSCORE: 99.2
7. Dumbbell Shoulder Press - 7,993,508 sets - mSCORE: 99.5
8. Dumbbell Fly - 7,705,017 sets - mSCORE: 98.3
9. Cable Row - 7,243,267 sets - mSCORE: 99.8
10. Dumbbell Skullcrusher - 6,955,739 sets - mSCORE: 98.4

### What This Data Tells Us
- Top 4 exercises all use dumbbells - most FitBod users train with dumbbells
- Push muscles (chest, arms) dominate the top 10
- Zero leg exercises in the top 10 - users systematically under-train legs
- KairoFit's AI should actively balance programming with leg rationale

### The mSCORE Metric
A proprietary FitBod efficacy score (0-100). NOT explained inline anywhere.
Users see this number with no tooltip or context. Confusing.
KairoFit equivalent: show evidence quality badge + one-line research rationale. Always explained.

---

## FitBod Workout Generator (fitbod.me/workouts)

### Filter Dimensions
Gender: Women / Men
Muscle Groups (24 options): Upper Body, Legs, Arms, Core, Full Body, Pull Day, Push Day, Chest, Biceps, Triceps, Shoulders, Bicep and Shoulders, Back, Abs, Chest and Back, Hamstrings, Glutes, Quadriceps, Chest and Tricep, Calves, Lower Back, Forearms, Trapezius, Adductors, Abductors
Equipment (19 options): Stability Ball, Dumbbells, Kettlebells, Barbells, Cable Machines, Weight Machines, Medicine Balls, Resistance Bands, Garage Gym, Pull Up Bar, BOSU, Smith Machine, TRX, EZ Bar, Landmine, PVC Pipe, Flat Bench, Foam Roller, Bodyweight
Fitness Experience: Beginner / Advanced (NO intermediate - this is Gap 14)
Fitness Goal: Build Muscle Mass, Build Strength, Olympic Lift, Power Lift, Get Lean and Burn Fat

### Key Flaws
- Single-select per category (cannot pick multiple muscle groups or equipment)
- No intermediate experience level
- Static URL generation - no personalization

---

## The 15 Navigation and Site UX Gaps

### Gap 1 - Three Inconsistent Navigation Bars
KairoFit fix: one global nav component, no variation across sections.

### Gap 2 - No Intermediate Level in Workout Generator
FitBod jumps from Beginner to Advanced.
KairoFit fix: 5 levels with behavioral descriptions.

### Gap 3 - No Search on Exercises Page
Cannot search by exercise name. Must browse by muscle group or equipment.
KairoFit fix: autocomplete search with fuzzy matching.

### Gap 4 - Rank By Dropdown Has Only Two Options
Popularity or mSCORE. No filter by difficulty, compound/isolation, muscle group.
KairoFit fix: multi-dimensional filtering.

### Gap 5 - Only 10 Exercises Shown on Index
No pagination, no Load More.
KairoFit fix: full library with pagination and search.

### Gap 6 - Equipment Carousel Inconsistency
Muscle groups use clean anatomical SVG diagrams.
Equipment uses product photos of varying quality.
"Hi-Lo Pulley Cable" and "Rope Cable" confuse beginners.
KairoFit fix: consistent icon system across both carousels.

### Gap 7 - Workout Generator is Single-Select Only
Cannot pick multiple muscle groups or equipment types.
KairoFit fix: multi-select on all filter dimensions.

### Gap 8 - Help Center Breaks Brand Continuity
Clicking Help sends users to fitbod.zendesk.com.
Different domain, fonts, colors, header design, no back navigation.
KairoFit fix: inline help or at minimum consistent layout.

### Gap 9 - Account Link Shows a Wall for Logged-Out Users
No preview of what the account contains.
KairoFit fix: "Your Account" page with feature preview before login prompt.

### Gap 10 - No Dark Mode on Marketing Pages
App uses dark theme. Website uses light. Jarring when coming from the app.
KairoFit fix: dark everywhere, no exceptions.

### Gap 11 - No Social Proof on Exercise/Workout Index Pages
Homepage has Editor's Choice badge and review count.
Exercise and workout pages have nothing.
KairoFit fix: aggregate stats and rating counts visible across all pages.

### Gap 12 - mSCORE Not Explained Inline
Proprietary metric shown with no tooltip or explainer.
KairoFit fix: inline "?" icon with one-sentence explanation always visible.

### Gap 13 - Equipment List Inconsistency Between Pages
Exercises page: 16 equipment items.
Workout generator: 19 equipment items.
Different items on each page.
KairoFit fix: one canonical equipment list used everywhere.

### Gap 14 - No Video Previews on Exercise Index
Page is titled "Exercise Guides and Videos" but shows no video thumbnails.
Must click through to see any video.
KairoFit fix: video thumbnail on every exercise card in the index.

### Gap 15 - UTM Parameters Applied Inconsistently
Some nav links tracked, some not. Analytics blind spots throughout the funnel.
KairoFit fix: consistent UTM tracking on all navigation events via PostHog.

---

## Content Insights for KairoFit

### FitBod Blog Structure (effective, worth replicating)
Categories: Training (Increase strength, Build muscle, Bodyweight, Free weights, Weight loss),
Nutrition (Macros, Superfoods, Supplements), Cardio (HIIT, Steady state), Product.
Authors with credentials: Mike Dewar, Dr. Niraj Patel, Amanda Dvorak, Emily Trinh.
Expert-authored content builds trust and SEO. KairoFit should build the same from day one.

### HSA/FSA Coverage
FitBod announced HSA/FSA eligibility (banner: "NEW - Fitbod is now covered by HSA | FSA").
This is a legitimate B2C and B2B growth lever.
Pursue after KairoFit has revenue to support the certification cost.

### Announcement Banner Pattern
FitBod uses a dark red banner at the very top for major announcements.
Effective for time-sensitive promotions and feature launches.
KairoFit can use the same pattern for paywall launch, new features, etc.
