import { UPI_APPS } from '../constants'
import { FLOW_CONFIG } from '../constants/payment'
import { UpiAppIcon } from './UpiAppIcon'
import {
  retryGooglePayShare,
  openPhonePeApp,
  openAppViaIntent,
  copyToClipboard,
  generateUpiLink,
} from '../utils/upi'

export default function AppFlowPanel({
  order,
  flow,
  qrDataUrl,
  instruction,
  onStatusChange,
  onLoading,
}) {
  if (!flow || !order) return null

  const cfg = FLOW_CONFIG[flow]
  if (!cfg) return null

  const handleRetryShare = async () => {
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

  const handleIntentFallback = async () => {
    onLoading?.(`${flow}_intent`)
    try {
      await openAppViaIntent(order, flow, onStatusChange)
    } finally {
      onLoading?.(null)
    }
  }

  const handleCopyLink = async () => {
    await copyToClipboard(generateUpiLink(order))
  }

  return (
    <div className={`animate-slide-up overflow-hidden rounded-2xl border-2 ${cfg.color} shadow-sm`}>
      <div className="flex items-center gap-3 px-5 py-4">
        <UpiAppIcon appKey={flow} className="h-10 w-10" />
        <div>
          <p className="font-bold text-gray-900">{cfg.title}</p>
          <p className="text-xs text-gray-600">{instruction}</p>
        </div>
      </div>

      <div className="border-t border-black/5 px-5 pb-5 pt-4">
        {/* QR on page — primary fallback display */}
        {qrDataUrl && (
          <div className="flex justify-center">
            <div className="rounded-xl border-2 border-white bg-white p-3 shadow-md">
              <img
                src={qrDataUrl}
                alt="UPI Payment QR Code"
                className="h-44 w-44 object-contain"
              />
            </div>
          </div>
        )}

        {/* PhonePe instructions */}
        {flow === UPI_APPS.PHONEPE && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white/80 px-4 py-3">
              <p className="text-sm font-semibold text-phonepe">📥 QR saved to Downloads</p>
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
          </div>
        )}

        {/* Google Pay instructions */}
        {flow === UPI_APPS.GOOGLE_PAY && (
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white/80 px-4 py-3">
              <p className="text-sm font-semibold text-gpay">Share with Google Pay</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-600">
                Use the share sheet to send the QR to Google Pay, or scan the QR code below.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRetryShare}
              className={`w-full rounded-xl ${cfg.accent} py-3.5 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] hover:opacity-90`}
            >
              Share QR → Select GPay
            </button>
          </div>
        )}

        {/* Secondary UPI Intent fallback */}
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleIntentFallback}
            className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-600 transition-all active:scale-[0.98] hover:bg-gray-50"
          >
            Try UPI Intent ↗
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 rounded-xl border border-gray-300 bg-white py-2.5 text-xs font-semibold text-gray-600 transition-all active:scale-[0.98] hover:bg-gray-50"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  )
}
