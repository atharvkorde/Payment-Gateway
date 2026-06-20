import { useState, useEffect } from 'react'
import { PAYMENT_TIMER_SECONDS } from '../constants/payment'

export default function CountdownTimer({ createdAt, onExpire }) {
  const getRemaining = () => {
    const elapsed = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)
    return Math.max(0, PAYMENT_TIMER_SECONDS - elapsed)
  }

  const [remaining, setRemaining] = useState(getRemaining)

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemaining()
      setRemaining(next)
      if (next <= 0) {
        clearInterval(interval)
        onExpire?.()
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [createdAt])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const isLow = remaining <= 300
  const isCritical = remaining <= 60

  return (
    <div
      className={`animate-fade-in flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        isCritical
          ? 'bg-red-100 text-red-600'
          : isLow
            ? 'bg-amber-100 text-amber-700'
            : 'bg-blue-50 text-blue-700'
      }`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${isCritical ? 'animate-pulse bg-red-500' : 'bg-current opacity-60'}`} />
      <span>{display}</span>
      <span className="text-xs font-normal opacity-70">remaining</span>
    </div>
  )
}
