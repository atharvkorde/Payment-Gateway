import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppFlowPanel from '../components/AppFlowPanel'
import CountdownTimer from '../components/CountdownTimer'
import DebugPanel from '../components/DebugPanel'
import DeviceWarning from '../components/DeviceWarning'
import { TestModeStatus } from '../components/FlowStatusBadges'
import OrderSummaryCard from '../components/OrderSummaryCard'
import PayViaQR from '../components/PayViaQR'
import PaymentButton, { GenericUpiButton } from '../components/PaymentButton'
import { UPI_APPS } from '../constants'
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
  { key: UPI_APPS.GOOGLE_PAY, handler: openGooglePay },
  { key: UPI_APPS.PHONEPE, handler: openPhonePe },
  { key: UPI_APPS.PAYTM, handler: openPaytm },
  { key: UPI_APPS.BHIM, handler: openBhim },
]

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { logLaunch } = useDebug()
  const order = getOrderById(orderId)
  const [loading, setLoading] = useState(null)
  const [testMode, setTestMode] = useState(null)
  const [flowStatus, setFlowStatus] = useState(null)
  const [showQrFallback, setShowQrFallback] = useState(false)
  const [activeFlow, setActiveFlow] = useState(null)
  const [expired, setExpired] = useState(false)

  if (!order) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-semibold text-gray-700">Order not found</p>
        <button type="button" onClick={() => navigate('/')} className="mt-4 font-medium text-brand-600">
          ← Back to Home
        </button>
      </div>
    )
  }

  const handleStatusChange = (result) => {
    logLaunch(result)
    if (result.testMode) setTestMode(result.testMode)
    if (result.flowStatus) setFlowStatus(result.flowStatus)
    if (result.showQr) setShowQrFallback(true)

    if (result.flow) {
      setActiveFlow({
        app: result.flow,
        qrDataUrl: result.qrDataUrl || activeFlow?.qrDataUrl,
        instruction: result.flowInstruction || activeFlow?.instruction,
        flowStatus: result.flowStatus || flowStatus,
        appOpenFailed: result.appOpenFailed ?? activeFlow?.appOpenFailed,
        appNotInstalled: result.appNotInstalled ?? activeFlow?.appNotInstalled,
      })
    } else if (result.qrDataUrl && result.app) {
      setActiveFlow((prev) => ({
        app: result.app,
        qrDataUrl: result.qrDataUrl,
        instruction: prev?.instruction,
        flowStatus: result.flowStatus || prev?.flowStatus,
        appOpenFailed: result.appOpenFailed ?? prev?.appOpenFailed,
      }))
    }
  }

  const handleLaunch = async (appKey, handler) => {
    setLoading(appKey)
    setTestMode('attempting')
    setFlowStatus(null)

    if (appKey === UPI_APPS.BHIM) {
      setActiveFlow(null)
      setShowQrFallback(false)
    }

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
        showQr: true,
        timestamp: new Date().toISOString(),
      })
    }

    setTimeout(() => setLoading(null), 2500)
  }

  const showQrSection = showQrFallback || activeFlow !== null

  return (
    <div className="payment-page -mx-4 min-h-full bg-gradient-to-b from-blue-50 via-white to-gray-50 px-4 pb-6">
      <DeviceWarning />

      <div className="animate-fade-in pt-2 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white shadow-lg shadow-brand-600/30">
          {order.merchantName.charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-medium text-gray-500">{order.merchantName}</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900">₹{order.amount}</p>
        <div className="mt-3 flex justify-center">
          <CountdownTimer createdAt={order.createdAt} onExpire={() => setExpired(true)} />
        </div>
        {expired && (
          <p className="mt-2 animate-fade-in text-xs font-medium text-red-500">
            Session expired — you can still attempt payment
          </p>
        )}
      </div>

      {testMode && (
        <div className="mt-4">
          <TestModeStatus testMode={testMode} />
        </div>
      )}

      <div className="mt-5">
        <OrderSummaryCard order={order} />
      </div>

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

      {activeFlow && (
        <div className="mt-5">
          <AppFlowPanel
            order={order}
            flow={activeFlow.app}
            qrDataUrl={activeFlow.qrDataUrl}
            instruction={activeFlow.instruction}
            flowStatus={activeFlow.flowStatus || flowStatus}
            appOpenFailed={activeFlow.appOpenFailed}
            appNotInstalled={activeFlow.appNotInstalled}
            onStatusChange={handleStatusChange}
            onLoading={setLoading}
          />
        </div>
      )}

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-semibold uppercase text-gray-400">
          {showQrSection ? 'scan qr' : 'or'}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <PayViaQR order={order} forceShow={showQrSection} qrDataUrl={activeFlow?.qrDataUrl} />

      <button
        type="button"
        onClick={() => navigate(`/status/${order.id}`)}
        className="animate-slide-up mt-6 w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-green-600/25 transition-all active:scale-[0.98]"
        style={{ animationDelay: '400ms' }}
      >
        ✓ I Have Paid
      </button>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-400">
        Paytm: QR Upload · GPay: Share + QR · PhonePe: QR Upload
      </p>

      <DebugPanel />
    </div>
  )
}
