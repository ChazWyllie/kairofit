import { redirect } from 'next/navigation'

// /onboarding always starts at the first screen
export default function OnboardingIndexPage() {
  redirect('/onboarding/goal')
}
