import { DEFAULT_CURRENCY } from '../constants'

/**
 * Build the standard UPI deep link.
 * Format: upi://pay?pa={UPI_ID}&pn={MERCHANT_NAME}&am={AMOUNT}&cu=INR&tn={TRANSACTION_NOTE}&tr={ORDER_ID}
 */
export function generateUpiLink({ upiId, merchantName, amount, transactionNote, orderId }) {
  const params = new URLSearchParams()
  params.set('pa', upiId)
  params.set('pn', merchantName)
  params.set('am', String(amount))
  params.set('cu', DEFAULT_CURRENCY)
  params.set('tn', transactionNote)
  params.set('tr', orderId)

  const query = params.toString()
  const upiUrl = `upi://pay?${query}`

  console.log('[UPI] Generated link:', upiUrl)
  console.log('[UPI] Params:', { upiId, merchantName, amount, transactionNote, orderId })

  return upiUrl
}

export function getUpiLinkForOrder(order) {
  return generateUpiLink(order)
}

export function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  }
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
  return Promise.resolve()
}

export async function shareContent({ title, text, url }) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url })
      return { status: 'shared' }
    } catch (err) {
      if (err.name === 'AbortError') return { status: 'cancelled' }
      throw err
    }
  }
  await copyToClipboard(url || text)
  return { status: 'copied_fallback' }
}

// Re-export intent launchers
export {
  detectInstalledApps,
  launchIntent,
  launchFallbackIntent,
  launchGenericIntent,
  openGooglePay,
  openPhonePe,
  openPaytm,
  openBhim,
  openGenericUpi,
  LAUNCH_STATUS,
} from './intent'
