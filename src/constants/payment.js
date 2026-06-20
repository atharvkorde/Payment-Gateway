export const PAYMENT_TIMER_SECONDS = 15 * 60 // 15 minutes

export const TEST_MODE_LABELS = {
  intent_opened: { label: 'Intent Opened', color: 'bg-green-500', icon: '✓' },
  intent_failed: { label: 'Intent Failed', color: 'bg-red-500', icon: '✗' },
  fallback_used: { label: 'Fallback Used', color: 'bg-amber-500', icon: '↻' },
  attempting: { label: 'Launching...', color: 'bg-blue-500', icon: '⟳' },
  qr_shown: { label: 'QR Displayed', color: 'bg-purple-500', icon: '▣' },
  qr_shared: { label: 'Share Sheet Opened', color: 'bg-green-600', icon: '↗' },
  qr_downloaded: { label: 'QR Downloaded', color: 'bg-phonepe', icon: '⬇' },
  error: { label: 'Error', color: 'bg-red-600', icon: '!' },
}

export const FLOW_CONFIG = {
  google_pay: {
    title: 'Google Pay',
    color: 'border-gpay/30 bg-blue-50',
    accent: 'bg-gpay',
  },
  phonepe: {
    title: 'PhonePe',
    color: 'border-phonepe/30 bg-purple-50',
    accent: 'bg-phonepe',
  },
  paytm: {
    title: 'Paytm',
    color: 'border-paytm/30 bg-sky-50',
    accent: 'bg-paytm',
  },
  bhim: {
    title: 'BHIM',
    color: 'border-bhim/30 bg-teal-50',
    accent: 'bg-bhim',
  },
}
