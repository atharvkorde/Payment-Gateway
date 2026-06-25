import { UPI_APPS, UPI_PACKAGES } from '../constants'
import { detectDevice, getBrowserLaunchStrategy } from './device'
import { generateUpiLink } from './upi'

export const LAUNCH_STATUS = {
  ATTEMPTING: 'attempting',
  INTENT_OPENED: 'intent_opened',
  INTENT_FAILED: 'intent_failed',
  FALLBACK_USED: 'fallback_used',
  QR_SHOWN: 'qr_shown',
  ERROR: 'error',
}

const PLAY_STORE_FALLBACK = {
  [UPI_PACKAGES[UPI_APPS.GOOGLE_PAY]]:
    'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user',
  [UPI_PACKAGES[UPI_APPS.PHONEPE]]:
    'https://play.google.com/store/apps/details?id=com.phonepe.app',
  [UPI_PACKAGES[UPI_APPS.PAYTM]]:
    'https://play.google.com/store/apps/details?id=net.one97.paytm',
  [UPI_PACKAGES[UPI_APPS.BHIM]]:
    'https://play.google.com/store/apps/details?id=in.org.npci.upiapp',
}

/**
 * Build Android intent URL with UPI params embedded in path.
 * Play Store fallback is disabled by default.
 */
export function buildIntentUrl(upiUrl, packageName, includeFallback = false) {
  const path = upiUrl.replace('upi://', '')
  const fallback = includeFallback ? PLAY_STORE_FALLBACK[packageName] : null
  const fallbackPart = fallback
    ? `;S.browser_fallback_url=${encodeURIComponent(fallback)}`
    : ''
  return `intent://${path}#Intent;scheme=upi;package=${packageName}${fallbackPart};end`
}

/**
 * Build generic UPI chooser intent (no package).
 */
export function buildGenericIntentUrl(upiUrl) {
  const path = upiUrl.replace('upi://', '')
  return `intent://${path}#Intent;scheme=upi;end`
}

/**
 * Web browsers cannot enumerate installed Android apps without a user gesture.
 * Returns detection state per app — updated after launch attempts via visibility heuristic.
 */
export function detectInstalledApps() {
  const device = detectDevice()
  const apps = [
    { key: UPI_APPS.GOOGLE_PAY, name: 'Google Pay', package: UPI_PACKAGES[UPI_APPS.GOOGLE_PAY] },
    { key: UPI_APPS.PHONEPE, name: 'PhonePe', package: UPI_PACKAGES[UPI_APPS.PHONEPE] },
    { key: UPI_APPS.PAYTM, name: 'Paytm', package: UPI_PACKAGES[UPI_APPS.PAYTM] },
    { key: UPI_APPS.BHIM, name: 'BHIM', package: UPI_PACKAGES[UPI_APPS.BHIM] },
  ]

  if (!device.isAndroid) {
    return apps.map((app) => ({
      ...app,
      installed: 'n/a',
      method: 'not_android',
    }))
  }

  // Cached results from previous launch attempts
  const cached = getDetectionCache()

  return apps.map((app) => ({
    ...app,
    installed: cached[app.key] || 'unknown',
    method: cached[app.key] ? 'launch_heuristic' : 'awaiting_launch',
  }))
}

const DETECTION_CACHE_KEY = 'upi_tester_app_detection'

function getDetectionCache() {
  try {
    return JSON.parse(sessionStorage.getItem(DETECTION_CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

export function cacheAppDetection(appKey, installed) {
  const cache = getDetectionCache()
  cache[appKey] = installed ? 'likely_installed' : 'likely_not_installed'
  sessionStorage.setItem(DETECTION_CACHE_KEY, JSON.stringify(cache))
}

/**
 * Execute URL launch using browser-specific strategy.
 */
function executeLaunch(url) {
  const strategy = getBrowserLaunchStrategy()
  console.log(`[Intent] Launch via ${strategy.name}:`, url)
  strategy.launch(url)
}

/**
 * Monitor page visibility to detect if UPI app opened.
 */
function watchForAppOpen(timeoutMs = 2500) {
  return new Promise((resolve) => {
    let resolved = false

    const markOpened = (reason) => {
      if (resolved) return
      resolved = true
      cleanup()
      console.log('[Intent] App likely opened:', reason)
      resolve(true)
    }

    const markFailed = () => {
      if (resolved) return
      resolved = true
      cleanup()
      console.log('[Intent] App did not open (timeout)')
      resolve(false)
    }

    const onVisibility = () => {
      if (document.hidden) markOpened('visibilitychange')
    }

    const onBlur = () => markOpened('blur')

    const onPageHide = () => markOpened('pagehide')

    const cleanup = () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pagehide', onPageHide)
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pagehide', onPageHide)

    const timer = setTimeout(markFailed, timeoutMs)
  })
}

/**
 * Launch app-specific Android intent.
 * Must be called synchronously inside a user-gesture handler.
 */
export async function launchIntent(order, appKey, packageName, onStatusChange) {
  const device = detectDevice()
  const upiUrl = generateUpiLink(order)
  const timestamp = new Date().toISOString()

  const baseResult = {
    app: appKey,
    package: packageName,
    upiUrl,
    timestamp,
    browser: device.browser,
    phase: 'intent',
  }

  onStatusChange?.({
    ...baseResult,
    testMode: LAUNCH_STATUS.ATTEMPTING,
    intentLaunchStatus: 'launching_intent',
    generatedUpiUrl: upiUrl,
    lastClickedApp: appKey,
  })

  if (!device.isAndroid) {
    if (device.isIOS) {
      executeLaunch(upiUrl)
      onStatusChange?.({
        ...baseResult,
        testMode: LAUNCH_STATUS.FALLBACK_USED,
        intentUrl: upiUrl,
        intentLaunchStatus: 'ios_upi_scheme',
      })
      return { ...baseResult, status: LAUNCH_STATUS.FALLBACK_USED, intentUrl: upiUrl }
    }

    onStatusChange?.({
      ...baseResult,
      testMode: LAUNCH_STATUS.QR_SHOWN,
      intentLaunchStatus: 'desktop_show_qr',
      showQr: true,
    })
    return { ...baseResult, status: LAUNCH_STATUS.QR_SHOWN, showQr: true }
  }

  const intentUrl = buildIntentUrl(upiUrl, packageName)
  console.log('[Intent] App-specific URL:', intentUrl)

  onStatusChange?.({
    ...baseResult,
    intentUrl,
    generatedUpiUrl: upiUrl,
  })

  // Launch immediately within user gesture
  executeLaunch(intentUrl)

  // Watch for app open (async, after sync launch)
  const opened = await watchForAppOpen(2500)

  if (opened) {
    cacheAppDetection(appKey, true)
    const result = {
      ...baseResult,
      status: LAUNCH_STATUS.INTENT_OPENED,
      intentUrl,
      testMode: LAUNCH_STATUS.INTENT_OPENED,
      intentLaunchStatus: 'intent_opened',
    }
    onStatusChange?.(result)
    console.log('[Intent] SUCCESS — app opened:', appKey)
    return result
  }

  // Intent failed — notify then try fallback
  cacheAppDetection(appKey, false)
  console.log('[Intent] FAILED — trying fallback for:', appKey)

  onStatusChange?.({
    ...baseResult,
    intentUrl,
    testMode: LAUNCH_STATUS.INTENT_FAILED,
    intentLaunchStatus: 'intent_failed',
  })

  return launchFallbackIntent(order, appKey, onStatusChange, { ...baseResult, intentUrl })
}

/**
 * Fallback: direct upi:// scheme via location.href
 */
export async function launchFallbackIntent(order, appKey, onStatusChange, baseResult = {}) {
  const upiUrl = generateUpiLink(order)
  const timestamp = new Date().toISOString()

  const result = {
    ...baseResult,
    app: appKey,
    upiUrl,
    timestamp,
    phase: 'fallback',
    intentUrl: upiUrl,
    testMode: LAUNCH_STATUS.FALLBACK_USED,
    intentLaunchStatus: 'fallback_upi_scheme',
  }

  onStatusChange?.(result)
  console.log('[Intent] Fallback UPI link:', upiUrl)

  try {
    window.location.href = upiUrl
  } catch (err) {
    console.error('[Intent] Fallback error:', err)
    onStatusChange?.({
      ...result,
      testMode: LAUNCH_STATUS.INTENT_FAILED,
      intentLaunchStatus: 'fallback_error',
      showQr: true,
    })
    return { ...result, status: LAUNCH_STATUS.INTENT_FAILED, showQr: true, error: err.message }
  }

  const opened = await watchForAppOpen(2000)

  if (opened) {
    onStatusChange?.({
      ...result,
      testMode: LAUNCH_STATUS.FALLBACK_USED,
      intentLaunchStatus: 'fallback_opened_app',
    })
    return { ...result, status: LAUNCH_STATUS.FALLBACK_USED }
  }

  // Final fallback — show QR
  console.log('[Intent] Fallback failed — showing QR')
  onStatusChange?.({
    ...result,
    testMode: LAUNCH_STATUS.QR_SHOWN,
    intentLaunchStatus: 'showing_qr',
    showQr: true,
  })
  return { ...result, status: LAUNCH_STATUS.QR_SHOWN, showQr: true }
}

/**
 * Launch generic UPI chooser (all apps).
 */
export async function launchGenericIntent(order, onStatusChange) {
  const device = detectDevice()
  const upiUrl = generateUpiLink(order)

  if (device.isAndroid) {
    const intentUrl = buildGenericIntentUrl(upiUrl)
    onStatusChange?.({
      app: UPI_APPS.GENERIC,
      intentUrl,
      upiUrl,
      testMode: LAUNCH_STATUS.ATTEMPTING,
      lastClickedApp: UPI_APPS.GENERIC,
    })
    executeLaunch(intentUrl)
    const opened = await watchForAppOpen(2500)
    if (opened) {
      onStatusChange?.({ testMode: LAUNCH_STATUS.INTENT_OPENED, intentLaunchStatus: 'chooser_opened' })
      return { status: LAUNCH_STATUS.INTENT_OPENED }
    }
    return launchFallbackIntent(order, UPI_APPS.GENERIC, onStatusChange)
  }

  return launchFallbackIntent(order, UPI_APPS.GENERIC, onStatusChange)
}
