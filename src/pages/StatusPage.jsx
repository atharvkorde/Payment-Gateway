import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import DebugPanel from '../components/DebugPanel'
import OrderSummary from '../components/OrderSummary'
import { ORDER_STATUS } from '../constants'
import { getOrderById, updateOrderStatus } from '../utils/storage'

const STATUS_OPTIONS = [
  {
    value: ORDER_STATUS.PENDING,
    label: 'Pending',
    desc: 'Payment not yet completed',
    color: 'border-amber-300 bg-amber-50 text-amber-800',
    activeColor: 'ring-2 ring-amber-400',
    icon: '⏳',
  },
  {
    value: ORDER_STATUS.SUCCESS,
    label: 'Success',
    desc: 'Manually mark as successful',
    color: 'border-green-300 bg-green-50 text-green-800',
    activeColor: 'ring-2 ring-green-400',
    icon: '✅',
  },
  {
    value: ORDER_STATUS.FAILED,
    label: 'Failed',
    desc: 'Manually mark as failed',
    color: 'border-red-300 bg-red-50 text-red-800',
    activeColor: 'ring-2 ring-red-400',
    icon: '❌',
  },
]

export default function StatusPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const initialOrder = getOrderById(orderId)
  const [order, setOrder] = useState(initialOrder)
  const [saved, setSaved] = useState(false)

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

  const handleStatusChange = (status) => {
    const updated = updateOrderStatus(order.id, status)
    if (updated) {
      setOrder(updated)
      setSaved(true)
      console.log('[Status] Updated to:', status, updated)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div>
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate(`/pay/${order.id}`)}
          className="text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          ← Back to Payment
        </button>
      </div>

      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Payment Status</h1>
        <p className="mt-1 text-sm text-gray-500">Manual status selection for testing only</p>
      </div>

      <OrderSummary order={order} />

      <div className="mt-6 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Select Status
        </p>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleStatusChange(opt.value)}
            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all active:scale-[0.98] ${opt.color} ${
              order.status === opt.value ? opt.activeColor : ''
            }`}
          >
            <span className="text-2xl">{opt.icon}</span>
            <div>
              <p className="font-semibold">{opt.label}</p>
              <p className="text-xs opacity-70">{opt.desc}</p>
            </div>
            {order.status === opt.value && (
              <span className="ml-auto text-xs font-bold uppercase">Current</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-xl bg-gray-100 p-4 text-center">
        <p className="text-xs text-gray-500">
          Current status:{' '}
          <span className="font-bold uppercase text-gray-700">{order.status}</span>
        </p>
        {saved && <p className="mt-1 text-xs font-semibold text-green-600">✓ Saved</p>}
      </div>

      <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-4">
        <p className="text-xs font-semibold text-gray-600">⚠️ No Auto-Verification</p>
        <p className="mt-1 text-xs text-gray-500">
          This platform does not verify payments with banks or NPCI. Status changes are manual
          for testing purposes only.
        </p>
      </div>

      <DebugPanel />
    </div>
  )
}
