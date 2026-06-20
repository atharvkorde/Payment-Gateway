export const PAYMENT_TIMER_SECONDS = 15 * 60 // 15 minutes

export const TEST_MODE_LABELS = {
  intent_opened: { label: 'Intent Opened', color: 'bg-green-500', icon: '✓' },
  intent_failed: { label: 'Intent Failed', color: 'bg-red-500', icon: '✗' },
  fallback_used: { label: 'Fallback Used', color: 'bg-amber-500', icon: '↻' },
  attempting: { label: 'Launching...', color: 'bg-blue-500', icon: '⟳' },
  qr_shown: { label: 'QR Fallback', color: 'bg-purple-500', icon: '▣' },
  error: { label: 'Error', color: 'bg-red-600', icon: '!' },
}
