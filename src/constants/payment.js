export const PAYMENT_TIMER_SECONDS = 15 * 60

export const TEST_MODE_LABELS = {
  intent_opened: { label: 'Intent Opened', color: 'bg-green-500', icon: '✓' },
  intent_failed: { label: 'Intent Failed', color: 'bg-red-500', icon: '✗' },
  fallback_used: { label: 'Fallback Used', color: 'bg-amber-500', icon: '↻' },
  attempting: { label: 'Launching...', color: 'bg-blue-500', icon: '⟳' },
  qr_generated: { label: 'QR Generated', color: 'bg-indigo-500', icon: '▣' },
  qr_downloaded: { label: 'QR Downloaded', color: 'bg-phonepe', icon: '⬇' },
  qr_shown: { label: 'QR Displayed', color: 'bg-purple-500', icon: '▣' },
  qr_shared: { label: 'Share Sheet Opened', color: 'bg-green-600', icon: '↗' },
  paytm_share_started: { label: 'Paytm Share Started', color: 'bg-blue-500', icon: '⟳' },
  paytm_share_success: { label: 'Share Sheet Opened', color: 'bg-green-600', icon: '↗' },
  paytm_share_failed: { label: 'Paytm Share Failed', color: 'bg-red-500', icon: '✗' },
  app_opened: { label: 'App Opened', color: 'bg-green-500', icon: '✓' },
  error: { label: 'Error', color: 'bg-red-600', icon: '!' },
}

export const METHOD_BADGES = {
  google_pay: { label: 'Share + QR', color: 'bg-blue-100 text-blue-700' },
  phonepe: { label: 'QR Upload', color: 'bg-purple-100 text-purple-700' },
  paytm: { label: 'Share + QR', color: 'bg-sky-100 text-sky-700' },
  bhim: { label: 'UPI Intent', color: 'bg-teal-100 text-teal-700' },
}

export const FLOW_CONFIG = {
  google_pay: {
    title: 'Google Pay',
    color: 'border-gpay/30 bg-blue-50',
    accent: 'bg-gpay',
    flowType: 'Share',
  },
  phonepe: {
    title: 'PhonePe',
    color: 'border-phonepe/30 bg-purple-50',
    accent: 'bg-phonepe',
    flowType: 'QR Upload',
  },
  paytm: {
    title: 'Paytm',
    color: 'border-paytm/30 bg-sky-50',
    accent: 'bg-paytm',
    flowType: 'Share',
  },
  bhim: {
    title: 'BHIM',
    color: 'border-bhim/30 bg-teal-50',
    accent: 'bg-bhim',
    flowType: 'UPI Intent',
  },
}

export const FLOW_STATUS_STEPS = ['qr_generated', 'qr_downloaded', 'app_opened']

export const PAYTM_DEBUG_LABELS = {
  paytm_share_started: 'Paytm Share Started',
  paytm_share_success: 'Paytm Share Success',
  paytm_share_failed: 'Paytm Share Failed',
  fallback_used: 'Fallback Used',
}
