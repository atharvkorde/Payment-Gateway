import QRCode from 'qrcode'

const QR_OPTIONS = {
  width: 512,
  margin: 2,
  color: { dark: '#1e293b', light: '#ffffff' },
  errorCorrectionLevel: 'M',
}

/**
 * Generate QR code as PNG data URL.
 */
export async function generateQrDataUrl(text) {
  const dataUrl = await QRCode.toDataURL(text, QR_OPTIONS)
  console.log('[QR] Generated data URL for:', text.slice(0, 60) + '...')
  return dataUrl
}

/**
 * Generate QR code as PNG Blob.
 */
export async function generateQrBlob(text) {
  const dataUrl = await generateQrDataUrl(text)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return blob
}

/**
 * Generate both data URL and blob in one call.
 */
export async function generateQrAssets(text) {
  const dataUrl = await generateQrDataUrl(text)
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return { dataUrl, blob }
}

/**
 * Trigger browser download of QR PNG.
 */
export function downloadQrImage(dataUrl, filename = 'upi-payment-qr.png') {
  const link = document.createElement('a')
  link.href = dataUrl
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  console.log('[QR] Downloaded:', filename)
}

/**
 * Share QR image + payment link via Android share sheet.
 * User can select Google Pay from the share targets.
 */
export async function shareQrWithPaymentLink({ blob, upiUrl, title, text }) {
  if (!navigator.share) {
    console.log('[QR] Web Share API not available')
    return { status: 'share_not_supported' }
  }

  const file = new File([blob], 'upi-payment-qr.png', { type: 'image/png' })
  const shareText = `${text}\n${upiUrl}`

  // Try sharing with image file (Android Chrome)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        title,
        text: shareText,
        files: [file],
      })
      console.log('[QR] Shared with QR image + link')
      return { status: 'shared_with_qr' }
    } catch (err) {
      if (err.name === 'AbortError') return { status: 'cancelled' }
      console.warn('[QR] File share failed, trying text share:', err)
    }
  }

  // Fallback: share text + URL only
  try {
    await navigator.share({ title, text: shareText, url: upiUrl })
    console.log('[QR] Shared text + link (no image)')
    return { status: 'shared_text_only' }
  } catch (err) {
    if (err.name === 'AbortError') return { status: 'cancelled' }
    throw err
  }
}
