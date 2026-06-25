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
  [UPI_APPS.PAYTM]: 'QR Upload',
  [UPI_APPS.GOOGLE_PAY]: 'Share',
  [UPI_APPS.PHONEPE]: 'QR Upload',
  [UPI_APPS.BHIM]: 'UPI Intent',
}

/**
 * Paytm — QR download + launcher only (same as PhonePe). No share sheet, no deep links.
 */
export async function openPaytm(order, onStatusChange) {
  const qrPayload = generateQrPaymentPayload(order)
  const timestamp = new Date().toISOString()

  const base = {
    app: UPI_APPS.PAYTM,
    timestamp,
    flow: UPI_APPS.PAYTM,
    flowType: FLOW_TYPES[UPI_APPS.PAYTM],
    showQr: true,
    qrOnly: true,
    flowInstruction: 'QR saved successfully — Open Paytm and import QR from Gallery',
  }

  onStatusChange?.({
    ...base,
    testMode: 'qr_generated',
    flowStatus: 'qr_generated',
    intentLaunchStatus: 'paytm_generating_qr',
  })

  const { dataUrl } = await generateQrAssets(qrPayload)
  const filename = `paytm-qr-${order.id}.png`

  downloadQrImage(dataUrl, filename)

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    testMode: 'qr_downloaded',
    flowStatus: 'qr_downloaded',
    intentLaunchStatus: 'paytm_qr_downloaded',
    flowInstruction: 'QR saved successfully.',
  })

  const appResult = await openPaytmApp()

  onStatusChange?.({
    ...base,
    qrDataUrl: dataUrl,
    launcherUrl: appResult.launcherUrl,
    intentUrl: appResult.launcherUrl,
    testMode: appResult.opened ? 'app_opened' : 'qr_downloaded',
    flowStatus: appResult.opened ? 'app_opened' : 'qr_downloaded',
    intentLaunchStatus: appResult.opened ? 'paytm_app_opened' : 'paytm_app_launch_failed',
    flowInstruction: appResult.opened
      ? 'Paytm opened — Scan & Pay → Gallery → select downloaded QR'
      : 'QR saved successfully — Tap Open Paytm or open manually',
    appOpenFailed: false,
    launchFailed: appResult.launchFailed,
  })

  console.log('[Paytm] QR upload flow complete — launcher URL:', appResult.launcherUrl)

  return {
    ...base,
    status: appResult.opened ? 'app_opened' : 'qr_downloaded',
    qrDataUrl: dataUrl,
    launcherUrl: appResult.launcherUrl,
    launchFailed: appResult.launchFailed,
  }
}

/**
 * Open Paytm app (launcher intent only).
 */
export async function retryOpenPaytmApp(onStatusChange) {
  onStatusChange?.({
    app: UPI_APPS.PAYTM,
    flow: UPI_APPS.PAYTM,
    flowType: FLOW_TYPES[UPI_APPS.PAYTM],
    testMode: 'attempting',
    intentLaunchStatus: 'paytm_open_app',
    showQr: true,
  })

  const result = await openPaytmApp()

  onStatusChange?.({
    app: UPI_APPS.PAYTM,
    flow: UPI_APPS.PAYTM,
    flowType: FLOW_TYPES[UPI_APPS.PAYTM],
    launcherUrl: result.launcherUrl,
    intentUrl: result.launcherUrl,
    testMode: result.opened ? 'app_opened' : 'qr_downloaded',
    flowStatus: result.opened ? 'app_opened' : 'qr_downloaded',
    intentLaunchStatus: result.opened ? 'paytm_app_opened' : 'paytm_app_launch_failed',
    appOpenFailed: !result.opened,
    launchFailed: result.launchFailed,
    showQr: true,
    flowInstruction: result.opened
      ? 'Paytm opened — Scan & Pay → Gallery → select downloaded QR'
      : 'Unable to launch Paytm. Please open Paytm manually.',
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
    launcherUrl: appResult.launcherUrl,
    intentUrl: appResult.launcherUrl,
    testMode: appResult.opened ? 'app_opened' : 'qr_downloaded',
    flowStatus: appResult.opened ? 'app_opened' : 'qr_downloaded',
    intentLaunchStatus: appResult.opened ? 'phonepe_app_opened' : 'phonepe_app_launch_failed',
    flowInstruction: appResult.opened
      ? 'PhonePe opened — Upload QR from Gallery'
      : 'QR saved successfully — Tap Open PhonePe or open manually',
    appOpenFailed: false,
    launchFailed: appResult.launchFailed,
  })

  return {
    ...base,
    status: appResult.opened ? 'app_opened' : 'qr_downloaded',
    qrDataUrl: dataUrl,
    launcherUrl: appResult.launcherUrl,
    launchFailed: appResult.launchFailed,
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
    launcherUrl: result.launcherUrl,
    intentUrl: result.launcherUrl,
    testMode: result.opened ? 'app_opened' : 'qr_downloaded',
    flowStatus: result.opened ? 'app_opened' : 'qr_downloaded',
    intentLaunchStatus: result.opened ? 'phonepe_app_opened' : 'phonepe_app_launch_failed',
    flowInstruction: result.opened
      ? 'PhonePe opened — Upload QR from Gallery'
      : 'Unable to launch PhonePe. Please open PhonePe manually.',
    appOpenFailed: !result.opened,
    launchFailed: result.launchFailed,
    showQr: true,
  })

  return result
}

export async function openAppViaIntent(order, appKey, onStatusChange) {
  const packageName = UPI_PACKAGES[appKey]
  if (!packageName) return launchFallbackIntent(order, appKey, onStatusChange)
  return launchIntent(order, appKey, packageName, onStatusChange)
}
