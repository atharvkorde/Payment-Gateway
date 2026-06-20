import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CountdownTimer from '../components/CountdownTimer'
import DebugPanel from '../components/DebugPanel'
import DeviceWarning from '../components/DeviceWarning'
import OrderSummaryCard from '../components/OrderSummaryCard'
import PayViaQR from '../components/PayViaQR'
import PaymentButton, { GenericUpiButton } from '../components/PaymentButton'
import TestModeStatus from '../components/TestModeStatus'
import { useDebug } from '../hooks/useDebug'
import { getOrderById } from '../utils/storage'
import {
  generateUpiLink,
  openGooglePay,
  openPhonePe,
  openPaytm,
  openBhim,
  openGenericUpi,
} from '../utils/upi'

const PAYMENT_APPS = [
  { key: 'google_pay', handler: openGooglePay, label: 'Google Pay' },
  { key: 'phonepe', handler: openPhonePe, label: 'PhonePe' },
  { key: 'paytm', handler: openPaytm, label: 'Paytm' },
  { key: 'bhim', handler: openBhim, label: 'BHIM' },
]

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { logLaunch } = useDebug()
  const order = getOrderById(orderId)
  const [loading, setLoading] = useState(null)
  const [testMode, setTestMode] = useState(null)
  const [showQrFallback, setShowQrFallback] = useState(false)
  const [expired, setExpired] = useState(false)

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-semibold text-gray-700">Order not found</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 font-medium text-brand-600"
        >
          ← Back to Home
        </button>
      </div>
    )
  }

  const upiUrl = generateUpiLink(order)

  const handleStatusChange = (result) => {
    logLaunch(result)
    if (result.testMode) setTestMode(result.testMode)
    if (result.showQr) setShowQrFallback(true)
  }

  const handleLaunch = async (appKey, handler) => {
    setLoading(appKey)
    setTestMode('attempting')
    setShowQrFallback(false)
    console.log(`[Payment] User tapped: ${appKey}`)

    try {
      await handler(order, handleStatusChange)
    } catch (err) {
      console.error('[Payment] Launch error:', err)
      setTestMode('intent_failed')
      setShowQrFallback(true)
      logLaunch({
        app: appKey,
        testMode: 'intent_failed',
        intentLaunchStatus: 'error',
        upiUrl,
        timestamp: new Date().toISOString(),
      })
    }

    setTimeout(() => setLoading(null), 2500)
  }

  const handlePaid = () => {
    navigate(`/status/${order.id}`)
  }

  return (
    <div className="payment-page -mx-4 min-h-full bg-gradient-to-b from-blue-50 via-white to-gray-50 px-4 pb-6">
      <DeviceWarning />

      {/* Header — TezGateway style */}
      <div className="animate-fade-in pt-2 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-600/30">
          {order.merchantName.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-medium text-gray-500">{order.merchantName}</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900">
          ₹{order.amount}
        </p>
        <div className="mt-3 flex justify-center">
          <CountdownTimer createdAt={order.createdAt} onExpire={() => setExpired(true)} />
        </div>
        {expired && (
          <p className="mt-2 animate-fade-in text-xs font-medium text-red-500">
            Session expired — you can still attempt payment
          </p>
        )}
      </div>

      {/* Test mode banner */}
      {testMode && (
        <div className="mt-4">
          <TestModeStatus testMode={testMode} />
        </div>
      )}

      {/* Order summary card */}
      <div className="mt-5">
        <OrderSummaryCard order={order} />
      </div>

      {/* UPI App grid — TezGateway large buttons */}
      <div className="mt-6">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-gray-400">
          Pay using UPI App
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_APPS.map(({ key, handler }, i) => (
            <PaymentButton
              key={key}
              appKey={key}
              index={i}
              loading={loading === key}
              onClick={() => handleLaunch(key, handler)}
            />
          ))}
        </div>
        <div className="mt-3">
          <GenericUpiButton
            loading={loading === 'generic'}
            onClick={() => handleLaunch('generic', openGenericUpi)}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold uppercase text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Pay via QR */}
      <PayViaQR order={order} forceShow={showQrFallback} />

      {/* I Have Paid */}
      <button
        type="button"
        onClick={handlePaid}
        className="animate-slide-up mt-6 w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-green-600/25 transition-all active:scale-[0.98] hover:from-green-700 hover:to-emerald-700"
        style={{ animationDelay: '400ms' }}
      >
        ✓ I Have Paid
      </button>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
        Testing platform only. No auto-verification.
        <br />
        Tap a UPI app above, complete payment, then confirm manually.
      </p>

      <DebugPanel />
    </div>
  )
}
