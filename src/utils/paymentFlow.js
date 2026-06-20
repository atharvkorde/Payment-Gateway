import { UPI_APPS, UPI_PACKAGES } from '../constants'
import { detectDevice } from './device'
import { openPaytmApp, openPhonePeAppLauncher } from './appLauncher'
import {
  launchIntent,
  launchFallbackIntent,
  launchGenericIntent,
  LAUNCH_STATUS,
} from './intent'
import { generateUpiLink } from './upi'
import { generateQrPaymentPayload } from './qrPayload'
import { generateQrAssets, downloadQrImage, shareQrWithPaymentLink } from './qr'

export { LAUNCH_STATUS }

export const FLOW_TYPES = {
  [UPI_APPS.PAYTM]: 'Share',
  [UPI_APPS.GOOGLE_PAY]: 'Share',
  [UPI_APPS.PHONEPE]: 'QR Upload',
  [UPI_APPS.BHIM]: 'UPI Intent',
}

function buildShareDetails(order) {
  const paymentLink = generateUpiLink(order)
  return {
    paymentLink,
    title: `Pay ₹${order.amount} to ${order.merchantName}`,
    text: [
      `Payment to ${order.merchantName}`,
      `Amount: ₹${order.amount}`,
      `Order: ${order.id}`,
      `UPI ID: ${order.upiId}`,
      `Link: ${paymentLink}`,
    ].join('\n'),
  }
}

/**
 * Paytm fallback when share fails — download QR, show on screen, no UPI Intent.
 */
async function paytmShareFallback(order, dataUrl, base, onStatusChange) {
  const filename = `paytm-qr-${order.id}.png`
  downloadQrImage(dataUrl, filename)

  console.log('[Paytm] Share failed — fallback: download QR + show on screen')

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'fallback_used',
    flowStatus: 'qr_downloaded',
    intentLaunchStatus: 'paytm_share_fallback',
    flowInstruction: 'Share failed — QR downloaded. Open Paytm and scan or import QR.',
    showQr: true,
    shareFailed: true,
  })

  return { ...base, status: 'fallback_used', qrDataUrl: dataUrl, shareFailed: true }
}

/**
 * Paytm — Share flow (same architecture as Google Pay).
 * QR PNG + payment link + Android share sheet. NO UPI Intent.
 */
export async function openPaytm(order, onStatusChange) {
  const timestamp = new Date().toISOString()
  const device = detectDevice()
  const { paymentLink, title, text } = buildShareDetails(order)

  const base = {
    app: UPI_APPS.PAYTM,
    flow: UPI_APPS.PAYTM,
    flowType: FLOW_TYPES[UPI_APPS.PAYTM],
    paymentLink,
    timestamp,
    showQr: true,
  }

  onStatusChange?.({
    ...base,
    testMode: 'paytm_share_started',
    flowStatus: 'qr_generated',
    intentLaunchStatus: 'paytm_share_started',
    flowInstruction: 'Select Paytm from the share sheet',
  })

  const { dataUrl, blob } = await generateQrAssets(paymentLink)

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'paytm_share_started',
    flowStatus: 'qr_generated',
    intentLaunchStatus: 'paytm_qr_generated',
  })

  if (device.isAndroid && navigator.share) {
    try {
      const shareResult = await shareQrWithPaymentLink({
        blob,
        upiUrl: paymentLink,
        title,
        text,
      })

      if (shareResult.status === 'shared_with_qr' || shareResult.status === 'shared_text_only') {
        onStatusChange?.({
          ...base,
          qrDataUrl: dataUrl,
          testMode: 'paytm_share_success',
          flowStatus: 'qr_shared',
          intentLaunchStatus: 'paytm_share_success',
          flowInstruction: 'Share Sheet Opened — Select Paytm to complete payment',
        })
        console.log('[Paytm] Share success:', shareResult.status)
        return { ...base, status: 'paytm_share_success', qrDataUrl: dataUrl }
      }

      if (shareResult.status === 'cancelled') {
        onStatusChange?.({
          ...base,
          qrDataUrl: dataUrl,
          testMode: 'qr_shown',
          intentLaunchStatus: 'paytm_share_cancelled',
          flowInstruction: 'Share cancelled — scan QR below or retry share',
        })
        return { ...base, status: 'cancelled', qrDataUrl: dataUrl }
      }

      if (shareResult.status === 'share_not_supported') {
        console.log('[Paytm] Share not supported — using fallback')
        return paytmShareFallback(order, dataUrl, base, onStatusChange)
      }
    } catch (err) {
      console.warn('[Paytm] Share failed:', err)
      onStatusChange?.({
        ...base,
        qrDataUrl: dataUrl,
        testMode: 'paytm_share_failed',
        intentLaunchStatus: 'paytm_share_failed',
      })
      return paytmShareFallback(order, dataUrl, base, onStatusChange)
    }
  }

  console.log('[Paytm] Share unavailable — using fallback')
  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'paytm_share_failed',
    intentLaunchStatus: 'paytm_share_not_available',
  })
  return paytmShareFallback(order, dataUrl, base, onStatusChange)
}

/**
 * Retry Paytm share sheet.
 */
export async function retryPaytmShare(order, onStatusChange) {
  const { paymentLink, title, text } = buildShareDetails(order)
  const { dataUrl, blob } = await generateQrAssets(paymentLink)

  onStatusChange?.({
    app: UPI_APPS.PAYTM,
    flow: UPI_APPS.PAYTM,
    flowType: FLOW_TYPES[UPI_APPS.PAYTM],
    qrDataUrl: dataUrl,
    paymentLink,
    showQr: true,
    testMode: 'paytm_share_started',
    intentLaunchStatus: 'paytm_retry_share',
    flowInstruction: 'Select Paytm from the share sheet',
  })

  try {
    const shareResult = await shareQrWithPaymentLink({ blob, upiUrl: paymentLink, title, text })

    if (shareResult.status === 'cancelled') {
      onStatusChange?.({
        testMode: 'qr_shown',
        intentLaunchStatus: 'paytm_share_cancelled',
        qrDataUrl: dataUrl,
        showQr: true,
      })
      return { status: 'cancelled' }
    }

    if (shareResult.status === 'shared_with_qr' || shareResult.status === 'shared_text_only') {
      onStatusChange?.({
        testMode: 'paytm_share_success',
        flowStatus: 'qr_shared',
        intentLaunchStatus: 'paytm_share_success',
        qrDataUrl: dataUrl,
        showQr: true,
      })
      return { status: 'paytm_share_success' }
    }
  } catch (err) {
    console.warn('[Paytm] Retry share failed:', err)
    onStatusChange?.({ testMode: 'paytm_share_failed', intentLaunchStatus: 'paytm_share_failed' })
  }

  return paytmShareFallback(
    order,
    dataUrl,
    { app: UPI_APPS.PAYTM, flow: UPI_APPS.PAYTM, flowType: FLOW_TYPES[UPI_APPS.PAYTM], paymentLink },
    onStatusChange
  )
}

/**
 * Open Paytm app (launcher only) — used in share fallback panel.
 */
export async function retryOpenPaytmApp(onStatusChange) {
  onStatusChange?.({
    app: UPI_APPS.PAYTM,
    flow: UPI_APPS.PAYTM,
    flowType: FLOW_TYPES[UPI_APPS.PAYTM],
    testMode: 'attempting',
    intentLaunchStatus: 'paytm_open_app',
  })

  const result = await openPaytmApp()

  onStatusChange?.({
    app: UPI_APPS.PAYTM,
    flow: UPI_APPS.PAYTM,
    flowType: FLOW_TYPES[UPI_APPS.PAYTM],
    testMode: result.opened ? 'app_opened' : 'fallback_used',
    flowStatus: result.opened ? 'app_opened' : 'qr_downloaded',
    intentLaunchStatus: result.opened ? 'paytm_app_opened' : 'paytm_app_open_failed',
    appOpenFailed: !result.opened,
  })

  return result
}

export async function openBhim(order, onStatusChange) {
  return launchIntent(order, UPI_APPS.BHIM, UPI_PACKAGES[UPI_APPS.BHIM], onStatusChange)
}

export async function openGenericUpi(order, onStatusChange) {
  return launchGenericIntent(order, onStatusChange)
}

/**
 * Google Pay — unchanged: QR + share sheet + intent fallback.
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
    flowType: FLOW_TYPES[UPI_APPS.GOOGLE_PAY],
    showQr: true,
  }

  onStatusChange?.({
    ...base,
    testMode: 'qr_generated',
    flowStatus: 'qr_generated',
    intentLaunchStatus: 'gpay_generating_qr',
  })

  const { dataUrl, blob } = await generateQrAssets(upiUrl)

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'qr_shown',
    flowStatus: 'qr_generated',
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

      if (shareResult.status === 'shared_with_qr' || shareResult.status === 'shared_text_only') {
        onStatusChange?.({
          ...base,
          qrDataUrl: dataUrl,
          testMode: 'qr_shared',
          flowStatus: 'qr_shared',
          intentLaunchStatus: 'gpay_share_sheet_opened',
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
        flowType: FLOW_TYPES[UPI_APPS.GOOGLE_PAY],
        showQr: true,
        flowInstruction:
          result.testMode === LAUNCH_STATUS.INTENT_OPENED
            ? 'Google Pay opened via UPI Intent'
            : 'Select Google Pay from share sheet or scan QR below',
      })
  )
}

export async function retryGooglePayShare(order, onStatusChange) {
  const upiUrl = generateUpiLink(order)
  const { dataUrl, blob } = await generateQrAssets(upiUrl)

  onStatusChange?.({
    app: UPI_APPS.GOOGLE_PAY,
    flow: UPI_APPS.GOOGLE_PAY,
    flowType: FLOW_TYPES[UPI_APPS.GOOGLE_PAY],
    qrDataUrl: dataUrl,
    showQr: true,
    testMode: 'attempting',
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
 * PhonePe — QR download + auto-open app (launcher only, NOT UPI Intent).
 */
export async function openPhonePe(order, onStatusChange) {
  const qrPayload = generateQrPaymentPayload(order)
  const timestamp = new Date().toISOString()

  const base = {
    app: UPI_APPS.PHONEPE,
    timestamp,
    flow: UPI_APPS.PHONEPE,
    flowType: FLOW_TYPES[UPI_APPS.PHONEPE],
    showQr: true,
    qrOnly: true,
    flowInstruction: 'Open PhonePe and upload QR from Gallery',
  }

  onStatusChange?.({
    ...base,
    testMode: 'qr_generated',
    flowStatus: 'qr_generated',
    intentLaunchStatus: 'phonepe_generating_qr',
  })

  const { dataUrl } = await generateQrAssets(qrPayload)
  const filename = `phonepe-qr-${order.id}.png`

  downloadQrImage(dataUrl, filename)

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'qr_downloaded',
    flowStatus: 'qr_downloaded',
    intentLaunchStatus: 'phonepe_qr_downloaded',
  })

  const appResult = await openPhonePeAppLauncher()

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: appResult.opened ? 'app_opened' : 'qr_downloaded',
    flowStatus: appResult.opened ? 'app_opened' : 'qr_downloaded',
    intentLaunchStatus: appResult.opened ? 'phonepe_app_opened' : 'phonepe_app_open_failed',
    flowInstruction: appResult.opened
      ? 'PhonePe opened — Upload QR from Gallery'
      : 'QR saved to Downloads — Open PhonePe manually and upload QR from Gallery',
    appOpenFailed: !appResult.opened,
  })

  return {
    ...base,
    status: appResult.opened ? 'app_opened' : 'qr_downloaded',
    qrDataUrl: dataUrl,
    appOpenFailed: !appResult.opened,
  }
}

export async function openPhonePeApp(order, onStatusChange) {
  onStatusChange?.({
    app: UPI_APPS.PHONEPE,
    flow: UPI_APPS.PHONEPE,
    flowType: FLOW_TYPES[UPI_APPS.PHONEPE],
    testMode: 'attempting',
    intentLaunchStatus: 'phonepe_retry_app_open',
    showQr: true,
  })

  const result = await openPhonePeAppLauncher()

  onStatusChange?.({
    app: UPI_APPS.PHONEPE,
    flow: UPI_APPS.PHONEPE,
    flowType: FLOW_TYPES[UPI_APPS.PHONEPE],
    testMode: result.opened ? 'app_opened' : 'qr_downloaded',
    flowStatus: result.opened ? 'app_opened' : 'qr_downloaded',
    intentLaunchStatus: result.opened ? 'phonepe_app_opened' : 'phonepe_app_open_failed',
    flowInstruction: result.opened
      ? 'PhonePe opened — Upload QR from Gallery'
      : 'Open PhonePe manually → Scan & Pay → Upload from Gallery',
    appOpenFailed: !result.opened,
    showQr: true,
  })

  return result
}

export async function openAppViaIntent(order, appKey, onStatusChange) {
  const packageName = UPI_PACKAGES[appKey]
  if (!packageName) return launchFallbackIntent(order, appKey, onStatusChange)
  return launchIntent(order, appKey, packageName, onStatusChange)
}
