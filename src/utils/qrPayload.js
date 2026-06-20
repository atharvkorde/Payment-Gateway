import { DEFAULT_CURRENCY } from '../constants'

/**
 * Build QR payment payload from order details.
 * Used ONLY for QR image encoding — never for browser navigation or UPI Intent.
 */
export function generateQrPaymentPayload(order) {
  const params = new URLSearchParams()
  params.set('pa', order.upiId)
  params.set('pn', order.merchantName)
  params.set('am', String(order.amount))
  params.set('cu', order.currency || DEFAULT_CURRENCY)
  params.set('tn', order.transactionNote)
  params.set('tr', order.id)

  const payload = `upi://pay?${params.toString()}`
  console.log('[QR] Payment payload generated (QR-only, not for intent launch)')
  return payload
}
