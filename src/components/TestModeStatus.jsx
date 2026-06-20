import { TEST_MODE_LABELS } from '../constants/payment'

export default function TestModeStatus({ testMode }) {
  if (!testMode || testMode === 'attempting') {
    const cfg = TEST_MODE_LABELS.attempting
    return (
      <div className={`animate-fade-in flex items-center gap-2 rounded-xl ${cfg.color} px-4 py-2.5 text-sm font-semibold text-white shadow-md`}>
        <span className="animate-spin">{cfg.icon}</span>
        {cfg.label}
      </div>
    )
  }

  const cfg = TEST_MODE_LABELS[testMode]
  if (!cfg) return null

  return (
    <div className={`animate-slide-up flex items-center gap-2 rounded-xl ${cfg.color} px-4 py-2.5 text-sm font-semibold text-white shadow-md`}>
      <span>{cfg.icon}</span>
      Test Mode: {cfg.label}
    </div>
  )
}
