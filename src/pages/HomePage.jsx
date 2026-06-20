import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DeviceWarning from '../components/DeviceWarning'
import DebugPanel from '../components/DebugPanel'
import { DEFAULT_MERCHANT_NAME, DEFAULT_UPI_ID } from '../constants'
import { getPreferences, createOrder } from '../utils/storage'
import { validateOrderForm } from '../utils/validation'

export default function HomePage() {
  const navigate = useNavigate()
  const prefs = getPreferences()

  const [form, setForm] = useState({
    merchantName: prefs.merchantName || DEFAULT_MERCHANT_NAME,
    upiId: prefs.upiId || DEFAULT_UPI_ID,
    amount: '',
    customerName: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)

    const result = validateOrderForm(form)
    if (!result.valid) {
      setErrors(result.errors)
      setSubmitting(false)
      console.log('[Validation] Errors:', result.errors)
      return
    }

    const order = createOrder(result.values)
    console.log('[Order] Created:', order)
    navigate(`/pay/${order.id}`)
  }

  return (
    <div>
      <DeviceWarning />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Payment</h1>
        <p className="mt-1 text-sm text-gray-500">
          Generate a test order and launch UPI apps on your device
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="Merchant Name"
          value={form.merchantName}
          onChange={handleChange('merchantName')}
          error={errors.merchantName}
          placeholder="Atharv Recharge"
        />
        <Field
          label="UPI ID"
          value={form.upiId}
          onChange={handleChange('upiId')}
          error={errors.upiId}
          placeholder="yourname@upi"
          mono
        />
        <Field
          label="Amount (INR)"
          value={form.amount}
          onChange={handleChange('amount')}
          error={errors.amount}
          placeholder="100.00"
          type="number"
          step="0.01"
          min="0"
        />
        <Field
          label="Customer Name"
          value={form.customerName}
          onChange={handleChange('customerName')}
          error={errors.customerName}
          placeholder="John Doe"
        />

        <button type="submit" disabled={submitting} className="btn-primary mt-2">
          {submitting ? 'Generating...' : 'Generate Order →'}
        </button>
      </form>

      <div className="mt-6 rounded-xl bg-blue-50 p-4">
        <p className="text-xs font-semibold text-blue-800">ℹ️ Testing Platform</p>
        <p className="mt-1 text-xs leading-relaxed text-blue-700">
          This is not a real payment gateway. No banking APIs, no auto-verification. Orders are
          stored locally in your browser.
        </p>
      </div>

      <DebugPanel />
    </div>
  )
}

function Field({ label, value, onChange, error, placeholder, type = 'text', mono, ...rest }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${mono ? 'font-mono' : ''} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : ''}`}
        {...rest}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
