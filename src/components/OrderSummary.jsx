export default function OrderSummary({ order }) {
  if (!order) return null

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <span className="text-sm text-gray-500">Amount to Pay</span>
        <span className="text-2xl font-bold text-gray-900">₹{order.amount}</span>
      </div>
      <DetailRow label="Merchant" value={order.merchantName} />
      <DetailRow label="UPI ID" value={order.upiId} mono />
      <DetailRow label="Order ID" value={order.id} mono />
      <DetailRow label="Transaction Note" value={order.transactionNote} />
      {order.customerName && <DetailRow label="Customer" value={order.customerName} />}
    </div>
  )
}

function DetailRow({ label, value, mono }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs text-gray-400">{label}</span>
      <span className={`text-right text-sm font-medium text-gray-700 ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  )
}
