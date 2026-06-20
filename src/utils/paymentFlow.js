import { UPI_APPS, UPI_PACKAGES } from '../constants'
import { detectDevice } from './device'
import {
  launchIntent,
  launchFallbackIntent,
  launchGenericIntent,
  LAUNCH_STATUS,
} from './intent'
import { generateUpiLink } from './upi'
import { generateQrAssets, downloadQrImage, shareQrWithPaymentLink } from './qr'

export { LAUNCH_STATUS }

/**
 * Paytm — direct UPI Intent launch.
 */
export async function openPaytm(order, onStatusChange) {
  return launchIntent(order, UPI_APPS.PAYTM, UPI_PACKAGES[UPI_APPS.PAYTM], onStatusChange)
}

/**
 * BHIM — direct UPI Intent with QR fallback on failure.
 */
export async function openBhim(order, onStatusChange) {
  return launchIntent(order, UPI_APPS.BHIM, UPI_PACKAGES[UPI_APPS.BHIM], onStatusChange)
}

/**
 * Generic UPI chooser.
 */
export async function openGenericUpi(order, onStatusChange) {
  return launchGenericIntent(order, onStatusChange)
}

/**
 * Google Pay — TezGateway flow:
 * 1. Generate QR image
 * 2. Show QR on page
 * 3. Open Android share sheet with QR + payment link (user picks GPay)
 * 4. Secondary fallback: UPI Intent
 */
export async function openGooglePay(order, onStatusChange) {
  const upiUrl = generateUpiLink(order)
  const timestamp = new Date().toISOString()
  const device = detectDevice()

  const base = {
    app: UPI_APPS.GOOGLE_PAY,
    upiUrl,
    timestamp,
    flow: UPI_APPS.GOOGLE_PAY,
    showQr: true,
  }

  onStatusChange?.({
    ...base,
    testMode: LAUNCH_STATUS.ATTEMPTING,
    intentLaunchStatus: 'gpay_generating_qr',
  })

  const { dataUrl, blob } = await generateQrAssets(upiUrl)

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'qr_shown',
    intentLaunchStatus: 'gpay_qr_generated',
    flowInstruction: 'Select Google Pay from the share sheet',
  })

  if (device.isAndroid && navigator.share) {
    try {
      const shareResult = await shareQrWithPaymentLink({
        blob,
        upiUrl,
        title: `Pay ₹${order.amount} to ${order.merchantName}`,
        text: `UPI Payment — ${order.id}`,
      })

      if (shareResult.status === 'shared_with_qr') {
        onStatusChange?.({
          ...base,
          qrDataUrl: dataUrl,
          testMode: 'qr_shared',
          intentLaunchStatus: 'gpay_share_sheet_opened',
        })
        return { ...base, status: 'qr_shared', qrDataUrl: dataUrl }
      }

      if (shareResult.status === 'shared_text_only') {
        onStatusChange?.({
          ...base,
          qrDataUrl: dataUrl,
          testMode: 'qr_shared',
          intentLaunchStatus: 'gpay_share_text_only',
        })
        return { ...base, status: 'qr_shared', qrDataUrl: dataUrl }
      }

      if (shareResult.status === 'cancelled') {
        onStatusChange?.({
          ...base,
          qrDataUrl: dataUrl,
          testMode: 'qr_shown',
          intentLaunchStatus: 'gpay_share_cancelled',
        })
        return { ...base, status: 'qr_shown', qrDataUrl: dataUrl }
      }
    } catch (err) {
      console.warn('[GPay] Share failed, falling back to intent:', err)
    }
  }

  // Secondary fallback: UPI Intent
  console.log('[GPay] Share unavailable — trying UPI Intent fallback')
  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    intentLaunchStatus: 'gpay_intent_fallback',
  })

  return launchIntent(
    order,
    UPI_APPS.GOOGLE_PAY,
    UPI_PACKAGES[UPI_APPS.GOOGLE_PAY],
    (result) =>
      onStatusChange?.({
        ...result,
        qrDataUrl: dataUrl,
        flow: UPI_APPS.GOOGLE_PAY,
        showQr: true,
        flowInstruction: result.testMode === LAUNCH_STATUS.INTENT_OPENED
          ? 'Google Pay opened via UPI Intent'
          : 'Select Google Pay from share sheet or scan QR below',
      })
  )
}

/**
 * Retry Google Pay share sheet (called from UI button).
 */
export async function retryGooglePayShare(order, onStatusChange) {
  const upiUrl = generateUpiLink(order)
  const { dataUrl, blob } = await generateQrAssets(upiUrl)

  onStatusChange?.({
    app: UPI_APPS.GOOGLE_PAY,
    flow: UPI_APPS.GOOGLE_PAY,
    qrDataUrl: dataUrl,
    showQr: true,
    testMode: LAUNCH_STATUS.ATTEMPTING,
    intentLaunchStatus: 'gpay_retry_share',
  })

  try {
    const shareResult = await shareQrWithPaymentLink({
      blob,
      upiUrl,
      title: `Pay ₹${order.amount} to ${order.merchantName}`,
      text: `UPI Payment — ${order.id}`,
    })

    if (shareResult.status === 'cancelled') {
      onStatusChange?.({ testMode: 'qr_shown', intentLaunchStatus: 'gpay_share_cancelled' })
      return { status: 'cancelled' }
    }

    if (shareResult.status !== 'share_not_supported') {
      onStatusChange?.({ testMode: 'qr_shared', intentLaunchStatus: 'gpay_share_sheet_opened' })
      return { status: 'qr_shared' }
    }
  } catch (err) {
    console.warn('[GPay] Retry share failed:', err)
  }

  return launchIntent(order, UPI_APPS.GOOGLE_PAY, UPI_PACKAGES[UPI_APPS.GOOGLE_PAY], onStatusChange)
}

/**
 * PhonePe — TezGateway flow:
 * 1. Generate QR image
 * 2. Auto-download QR to gallery
 * 3. Show QR on page + instruction
 * 4. "Open PhonePe" button triggers UPI Intent (secondary fallback)
 */
export async function openPhonePe(order, onStatusChange) {
  const upiUrl = generateUpiLink(order)
  const timestamp = new Date().toISOString()

  const base = {
    app: UPI_APPS.PHONEPE,
    upiUrl,
    timestamp,
    flow: UPI_APPS.PHONEPE,
    showQr: true,
    flowInstruction: 'Open PhonePe and upload QR from Gallery',
  }

  onStatusChange?.({
    ...base,
    testMode: LAUNCH_STATUS.ATTEMPTING,
    intentLaunchStatus: 'phonepe_generating_qr',
  })

  const { dataUrl } = await generateQrAssets(upiUrl)
  const filename = `phonepe-qr-${order.id}.png`

  downloadQrImage(dataUrl, filename)

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'qr_downloaded',
    intentLaunchStatus: 'phonepe_qr_downloaded',
  })

  console.log('[PhonePe] QR downloaded, awaiting user action')

  return {
    ...base,
    status: 'qr_downloaded',
    qrDataUrl: dataUrl,
  }
}

/**
 * Open PhonePe app via UPI Intent (secondary fallback button).
 */
export async function openPhonePeApp(order, onStatusChange) {
  const upiUrl = generateUpiLink(order)

  onStatusChange?.({
    app: UPI_APPS.PHONEPE,
    flow: UPI_APPS.PHONEPE,
    upiUrl,
    testMode: LAUNCH_STATUS.ATTEMPTING,
    intentLaunchStatus: 'phonepe_intent_launch',
    showQr: true,
    flowInstruction: 'Open PhonePe and upload QR from Gallery',
  })

  return launchIntent(
    order,
    UPI_APPS.PHONEPE,
    UPI_PACKAGES[UPI_APPS.PHONEPE],
    (result) =>
      onStatusChange?.({
        ...result,
        flow: UPI_APPS.PHONEPE,
        showQr: true,
        flowInstruction:
          result.testMode === LAUNCH_STATUS.INTENT_OPENED
            ? 'PhonePe opened — or upload QR from Gallery'
            : 'Open PhonePe and upload QR from Gallery',
      })
  )
}

/**
 * Secondary UPI Intent fallback for any app (explicit user action).
 */
export async function openAppViaIntent(order, appKey, onStatusChange) {
  const packageName = UPI_PACKAGES[appKey]
  if (!packageName) return launchFallbackIntent(order, appKey, onStatusChange)
  return launchIntent(order, appKey, packageName, onStatusChange)
}
