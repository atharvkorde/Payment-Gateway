import { useState } from 'react'
import { Link } from 'react-router-dom'
import DebugPanel from '../components/DebugPanel'
import { ORDER_STATUS } from '../constants'
import { getOrders, getOrderStats, clearAllOrders } from '../utils/storage'

const statusBadge = {
  [ORDER_STATUS.PENDING]: 'bg-amber-100 text-amber-700',
  [ORDER_STATUS.SUCCESS]: 'bg-green-100 text-green-700',
  [ORDER_STATUS.FAILED]: 'bg-red-100 text-red-700',
}

export default function AdminPage() {
  const [orders, setOrders] = useState(getOrders())
  const stats = getOrderStats()

  const refresh = () => setOrders(getOrders())

  const handleClear = () => {
    if (window.confirm('Delete all orders from local storage?')) {
      clearAllOrders()
      refresh()
      console.log('[Admin] All orders cleared')
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Local storage order overview</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Orders" value={stats.total} color="bg-brand-50 text-brand-700" />
        <StatCard label="Pending" value={stats.pending} color="bg-amber-50 text-amber-700" />
        <StatCard label="Success" value={stats.success} color="bg-green-50 text-green-700" />
        <StatCard label="Failed" value={stats.failed} color="bg-red-50 text-red-700" />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Recent Orders</h2>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium text-red-500 hover:text-red-700"
          >
            Clear All
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="card py-8 text-center">
            <p className="text-sm text-gray-400">No orders yet</p>
            <Link to="/" className="mt-2 inline-block text-sm font-medium text-brand-600">
              Create first order →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/pay/${order.id}`}
                className="card flex items-center justify-between transition-all hover:shadow-md active:scale-[0.99]"
              >
                <div>
                  <p className="font-mono text-xs text-gray-400">{order.id}</p>
                  <p className="text-sm font-semibold text-gray-800">{order.merchantName}</p>
                  <p className="text-xs text-gray-500">
                    ₹{order.amount} · {order.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadge[order.status]}`}
                  >
                    {order.status}
                  </span>
                  <p className="mt-1 text-[10px] text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <DebugPanel />
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}
