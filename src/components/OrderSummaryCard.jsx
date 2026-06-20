import { useState } from 'react'

export default function OrderSummaryCard({ order }) {
  const [expanded, setExpanded] = useState(false)

  if (!order) return null

  return (
    <div className="animate-slide-up overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-left"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Order Summary</p>
          <p className="mt-0.5 font-mono text-sm font-semibold text-gray-800">{order.id}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
            {order.status}
          </span>
          <span className={`text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {expanded && (
        <div className="animate-fade-in space-y-2.5 border-t border-gray-100 px-5 pb-4 pt-3">
          <Row label="Merchant" value={order.merchantName} />
          <Row label="UPI ID" value={order.upiId} mono />
          <Row label="Customer" value={order.customerName} />
          <Row label="Transaction Note" value={order.transactionNote} />
          <Row label="Currency" value={order.currency || 'INR'} />
        </div>
      )}
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-xs text-gray-400">{label}</span>
      <span className={`text-right text-xs font-medium text-gray-700 ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}
