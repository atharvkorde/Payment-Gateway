import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { generateUpiLink, copyToClipboard } from '../utils/upi'

export default function PayViaQR({ order, forceShow = false }) {
  const [expanded, setExpanded] = useState(forceShow)
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (forceShow) setExpanded(true)
  }, [forceShow])

  if (!order) return null

  const upiUrl = generateUpiLink(order)
  const show = expanded || forceShow

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  const handleCopy = async () => {
    await copyToClipboard(upiUrl)
    showToast('Link copied!')
  }

  return (
    <div className="animate-slide-up overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg">
            📱
          </div>
          <div>
            <p className="font-semibold text-gray-900">Pay via QR</p>
            <p className="text-xs text-gray-500">Scan with any UPI app</p>
          </div>
        </div>
        <span className={`text-gray-400 transition-transform ${show ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {show && (
        <div className="animate-fade-in border-t border-gray-100 px-5 pb-5 pt-4">
          <div className="flex justify-center">
            <div className="rounded-xl border-2 border-gray-100 bg-white p-3 shadow-inner">
              <QRCodeSVG value={upiUrl} size={180} level="M" bgColor="#ffffff" fgColor="#1e293b" />
            </div>
          </div>
          <p className="mt-3 text-center font-mono text-[10px] text-gray-400 break-all">{order.upiId}</p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-3 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-all active:scale-[0.98] hover:bg-gray-50"
          >
            Copy Payment Link
          </button>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
