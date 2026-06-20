import { FLOW_STATUS_STEPS, TEST_MODE_LABELS } from '../constants/payment'

export default function FlowStatusBadges({ flowStatus, testMode }) {
  const current = flowStatus || testMode
  if (!current) return null

  const steps = [
    { key: 'qr_generated', label: 'QR Generated' },
    { key: 'qr_downloaded', label: 'QR Downloaded' },
    { key: 'app_opened', label: 'App Opened' },
  ]

  const currentIdx = FLOW_STATUS_STEPS.indexOf(current)
    const isShared =
      current === 'qr_shared' ||
      current === 'paytm_share_success' ||
      current === 'paytm_share_started'

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {steps.map((step, i) => {
        const done =
          currentIdx >= FLOW_STATUS_STEPS.indexOf(step.key) ||
          (step.key === 'qr_generated' && (current === 'qr_shown' || isShared))
        const active = current === step.key

        return (
          <span
            key={step.key}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all ${
              active
                ? 'bg-brand-600 text-white ring-2 ring-brand-300'
                : done
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-400'
            }`}
          >
            {done && !active ? '✓ ' : ''}
            {step.label}
          </span>
        )
      })}
      {isShared && (
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-bold uppercase text-green-700">
          ✓ Shared
        </span>
      )}
    </div>
  )
}

export function TestModeStatus({ testMode }) {
  if (!testMode) return null

  const cfg = TEST_MODE_LABELS[testMode] || TEST_MODE_LABELS.attempting

  return (
    <div
      className={`animate-slide-up flex items-center justify-center gap-2 rounded-xl ${cfg.color} px-4 py-2.5 text-sm font-semibold text-white shadow-md`}
    >
      {testMode === 'attempting' ? (
        <span className="animate-spin">{cfg.icon}</span>
      ) : (
        <span>{cfg.icon}</span>
      )}
      {cfg.label}
    </div>
  )
}
