import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import DeviceWarning from '../components/DeviceWarning'
import DebugPanel from '../components/DebugPanel'
import { getOrderById } from '../utils/storage'
import { generateUpiLink, copyToClipboard, shareContent } from '../utils/upi'

export default function QRPage() {
  const { orderId } = useParams()
  const order = getOrderById(orderId)
  const qrRef = useRef(null)
  const [toast, setToast] = useState('')

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-semibold text-gray-700">Order not found</p>
        <Link to="/" className="mt-4 inline-block text-brand-600 font-medium">
          ← Back to Home
        </Link>
      </div>
    )
  }

  const upiUrl = generateUpiLink(order)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const data = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      canvas.width = 512
      canvas.height = 512
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 512, 512)
      ctx.drawImage(img, 0, 0, 512, 512)
      URL.revokeObjectURL(url)

      const link = document.createElement('a')
      link.download = `upi-qr-${order.id}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      console.log('[QR] Downloaded QR for order:', order.id)
      showToast('QR downloaded!')
    }
    img.src = url
  }

  const handleCopyUpiId = async () => {
    await copyToClipboard(order.upiId)
    console.log('[QR] Copied UPI ID:', order.upiId)
    showToast('UPI ID copied!')
  }

  const handleCopyLink = async () => {
    await copyToClipboard(upiUrl)
    console.log('[QR] Copied payment link:', upiUrl)
    showToast('Payment link copied!')
  }

  const handleShare = async () => {
    try {
      const result = await shareContent({
        title: `Pay ₹${order.amount} to ${order.merchantName}`,
        text: `UPI Payment - Order ${order.id}`,
        url: upiUrl,
      })
      console.log('[QR] Share result:', result)
      showToast(result.status === 'shared' ? 'Shared!' : 'Link copied!')
    } catch {
      showToast('Share failed')
    }
  }

  return (
    <div>
      <DeviceWarning />

      <div className="mb-5">
        <Link to={`/pay/${order.id}`} className="text-sm font-medium text-gray-500 hover:text-gray-700">
          ← Back to Payment
        </Link>
      </div>

      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Scan & Pay</h1>
        <p className="mt-1 text-sm text-gray-500">Scan QR with any UPI app</p>
      </div>

      <div className="mx-auto mt-6 flex justify-center">
        <div ref={qrRef} className="rounded-2xl border-4 border-white bg-white p-4 shadow-lg">
          <QRCodeSVG
            value={upiUrl}
            size={220}
            level="M"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#1e293b"
          />
        </div>
      </div>

      <div className="card mt-6 space-y-2 text-center">
        <p className="text-2xl font-bold text-gray-900">₹{order.amount}</p>
        <p className="text-sm font-medium text-gray-700">{order.merchantName}</p>
        <p className="font-mono text-xs text-gray-400">{order.upiId}</p>
        <p className="font-mono text-xs text-gray-400">{order.id}</p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ActionButton onClick={handleDownload} label="Download QR" icon="⬇️" />
        <ActionButton onClick={handleCopyUpiId} label="Copy UPI ID" icon="📋" />
        <ActionButton onClick={handleCopyLink} label="Copy Link" icon="🔗" />
        <ActionButton onClick={handleShare} label="Share QR" icon="📤" />
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white shadow-xl">
          {toast}
        </div>
      )}

      <DebugPanel />
    </div>
  )
}

function ActionButton({ onClick, label, icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 transition-all active:scale-[0.98] hover:bg-gray-50"
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}
