import { UPI_APPS } from '../constants'
import { FLOW_CONFIG, PAYTM_QR_STEPS } from '../constants/payment'
import { UpiAppIcon } from './UpiAppIcon'
import FlowStatusBadges from './FlowStatusBadges'
import {
  retryGooglePayShare,
  openPhonePeApp,
  retryOpenPaytmApp,
  openAppViaIntent,
} from '../utils/upi'

export default function AppFlowPanel({
  order,
  flow,
  qrDataUrl,
  instruction,
  flowStatus,
  appOpenFailed,
  appNotInstalled,
  onStatusChange,
  onLoading,
}) {
  if (!flow || !order) return null

  const cfg = FLOW_CONFIG[flow]
  if (!cfg) return null

  const handleRetryGPayShare = async () => {
    onLoading?.(flow)
    try {
      await retryGooglePayShare(order, onStatusChange)
    } finally {
      onLoading?.(null)
    }
  }

  const handleOpenPhonePe = async () => {
    onLoading?.('phonepe_open')
    try {
      await openPhonePeApp(order, onStatusChange)
    } finally {
      onLoading?.(null)
    }
  }

  const handleOpenPaytm = async () => {
    onLoading?.('paytm_open')
    try {
      await retryOpenPaytmApp(onStatusChange)
    } finally {
      onLoading?.(null)
    }
  }

  const handleIntentFallback = async () => {
    onLoading?.(`${flow}_intent`)
    try {
      await openAppViaIntent(order, flow, onStatusChange)
    } finally {
      onLoading?.(null)
    }
  }

  return (
    <div className={`animate-slide-up overflow-hidden rounded-2xl border-2 ${cfg.color} shadow-sm`}>
      <div className="flex items-center gap-3 px-5 py-4">
        <UpiAppIcon appKey={flow} className="h-10 w-10" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{cfg.title}</p>
            <span className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase text-gray-600">
              {cfg.flowType}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-600">{instruction}</p>
        </div>
      </div>

      <div className="border-t border-black/5 px-5 pb-5 pt-3">
        <FlowStatusBadges flowStatus={flowStatus} />

        {qrDataUrl && (
          <div className="mt-4 flex justify-center">
            <div className="rounded-xl border-2 border-white bg-white p-3 shadow-md">
              <img src={qrDataUrl} alt="Payment QR Code" className="h-44 w-44 object-contain" />
            </div>
          </div>
        )}

        {/* Paytm — QR upload flow (mirrors PhonePe) */}
        {flow === UPI_APPS.PAYTM && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white/80 px-4 py-3">
              <p className="text-sm font-semibold text-paytm">✓ QR saved successfully</p>
              <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-gray-600">
                {PAYTM_QR_STEPS.map((step, i) => (
                  <li key={step}>
                    {i + 1}. {step}
                  </li>
                ))}
              </ol>
            </div>

            <button
              type="button"
              onClick={handleOpenPaytm}
              className={`w-full rounded-xl ${cfg.accent} py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] hover:opacity-90`}
            >
              Open Paytm
            </button>

            {(appNotInstalled || appOpenFailed) && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs font-semibold text-red-600">
                Please install Paytm.
              </p>
            )}
          </div>
        )}

        {/* PhonePe — QR upload flow */}
        {flow === UPI_APPS.PHONEPE && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white/80 px-4 py-3">
              <p className="text-sm font-semibold text-phonepe">✓ QR saved successfully</p>
              <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-gray-600">
                <li>1. Open PhonePe app</li>
                <li>2. Go to Scan & Pay → Upload from Gallery</li>
                <li>3. Select the downloaded QR image</li>
                <li>4. Complete payment</li>
              </ol>
            </div>

            <button
              type="button"
              onClick={handleOpenPhonePe}
              className={`w-full rounded-xl ${cfg.accent} py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] hover:opacity-90`}
            >
              Open PhonePe
            </button>

            {appOpenFailed && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Could not auto-open PhonePe. Open manually and upload QR from Gallery.
              </p>
            )}
          </div>
        )}

        {/* Google Pay — unchanged */}
        {flow === UPI_APPS.GOOGLE_PAY && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white/80 px-4 py-3">
              <p className="text-sm font-semibold text-gpay">Share with Google Pay</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Use the share sheet to send the QR to Google Pay, or scan the QR code above.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRetryGPayShare}
              className={`w-full rounded-xl ${cfg.accent} py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] hover:opacity-90`}
            >
              Share QR → Select GPay
            </button>

            <button
              type="button"
              onClick={handleIntentFallback}
              className="w-full rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-600 transition-all active:scale-[0.98] hover:bg-gray-50"
            >
              Try UPI Intent ↗ (fallback)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
