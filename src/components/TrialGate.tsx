// Trial messaging removed — Free plan is permanent. Gating happens via property/feature limits.
export function TrialBanner() { return null; }
export function TrialGate({ children }: { children: React.ReactNode }) { return <>{children}</>; }
