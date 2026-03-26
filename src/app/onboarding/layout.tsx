// Onboarding does not use the app shell layout.
// No auth check here - onboarding runs before the user has an account.
export default function OnboardingRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
