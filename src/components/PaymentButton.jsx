import { UpiAppIcon } from './UpiAppIcon'
import { METHOD_BADGES } from '../constants/payment'

const appConfig = {
  google_pay: {
    label: 'Google Pay',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-gpay/40 hover:shadow-gpay/20',
    ring: 'active:ring-gpay/30',
    text: 'text-gray-800',
  },
  phonepe: {
    label: 'PhonePe',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-phonepe/40 hover:shadow-phonepe/20',
    ring: 'active:ring-phonepe/30',
    text: 'text-gray-800',
  },
  paytm: {
    label: 'Paytm',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-paytm/40 hover:shadow-paytm/20',
    ring: 'active:ring-paytm/30',
    text: 'text-gray-800',
  },
  bhim: {
    label: 'BHIM',
    bg: 'bg-white',
    border: 'border-gray-200 hover:border-bhim/40 hover:shadow-bhim/20',
    ring: 'active:ring-bhim/30',
    text: 'text-gray-800',
  },
}

export default function PaymentButton({ appKey, onClick, loading, index = 0 }) {
  const cfg = appConfig[appKey]
  const badge = METHOD_BADGES[appKey]
  if (!cfg) return null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={{ animationDelay: `${index * 80}ms` }}
      className={`animate-slide-up group relative flex flex-col items-center gap-2 rounded-2xl border-2 ${cfg.bg} ${cfg.border} p-4 shadow-sm transition-all duration-200 active:scale-95 active:ring-4 ${cfg.ring} hover:shadow-lg disabled:opacity-50 disabled:active:scale-100`}
    >
      {badge && (
        <span
          className={`absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badge.color}`}
        >
          {badge.label}
        </span>
      )}

      <div className={`relative mt-1 transition-transform duration-200 group-active:scale-110 ${loading ? 'animate-pulse' : ''}`}>
        <UpiAppIcon appKey={appKey} className="h-14 w-14 drop-shadow-sm" />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
          </div>
        )}
      </div>
      <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
    </button>
  )
}

export function GenericUpiButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="animate-slide-up flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 py-3 text-sm font-semibold text-gray-600 transition-all active:scale-[0.98] hover:border-gray-400 hover:bg-gray-100 disabled:opacity-50"
      style={{ animationDelay: '320ms' }}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
      ) : (
        <>↑ Open All UPI Apps</>
      )}
    </button>
  )
}
