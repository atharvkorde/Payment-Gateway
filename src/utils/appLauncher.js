import { UPI_APPS, UPI_PACKAGES } from '../constants'
import { detectDevice, getBrowserLaunchStrategy } from './device'

const APP_LAUNCH_URLS = {
  [UPI_APPS.PAYTM]: [
    `intent://paytmmp#Intent;scheme=paytmmp;package=${UPI_PACKAGES[UPI_APPS.PAYTM]};end`,
    'paytmmp://',
    `intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${UPI_PACKAGES[UPI_APPS.PAYTM]};end`,
  ],
  [UPI_APPS.PHONEPE]: [
    `intent://phonepe#Intent;scheme=phonepe;package=${UPI_PACKAGES[UPI_APPS.PHONEPE]};end`,
    'phonepe://',
    `intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${UPI_PACKAGES[UPI_APPS.PHONEPE]};end`,
  ],
}

function watchForAppOpen(timeoutMs = 2500) {
  return new Promise((resolve) => {
    let resolved = false

    const markOpened = () => {
      if (resolved) return
      resolved = true
      cleanup()
      resolve(true)
    }

    const markFailed = () => {
      if (resolved) return
      resolved = true
      cleanup()
      resolve(false)
    }

    const onVisibility = () => {
      if (document.hidden) markOpened()
    }

    const cleanup = () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pagehide', onPageHide)
    }

    const onBlur = () => markOpened()
    const onPageHide = () => markOpened()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pagehide', onPageHide)

    const timer = setTimeout(markFailed, timeoutMs)
  })
}

function tryLaunchUrl(url) {
  const strategy = getBrowserLaunchStrategy()
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  } catch {
    strategy.launch(url)
  }
}

/**
 * Open a UPI app directly (launcher only — NOT a payment/UPI Intent).
 */
export async function openAppOnly(appKey) {
  const device = detectDevice()
  const urls = APP_LAUNCH_URLS[appKey]

  if (!urls) {
    console.warn('[AppLauncher] Unknown app:', appKey)
    return { opened: false, status: 'unknown_app' }
  }

  if (!device.isAndroid) {
    console.log('[AppLauncher] Not Android — cannot open app')
    return { opened: false, status: 'not_android' }
  }

  console.log('[AppLauncher] Opening app (launcher only):', appKey)

  // Try first URL immediately within user gesture
  tryLaunchUrl(urls[0])

  let opened = await watchForAppOpen(2000)

  if (!opened && urls[1]) {
    console.log('[AppLauncher] First attempt failed, trying scheme:', urls[1])
    tryLaunchUrl(urls[1])
    opened = await watchForAppOpen(1500)
  }

  if (!opened && urls[2]) {
    console.log('[AppLauncher] Trying launcher intent')
    tryLaunchUrl(urls[2])
    opened = await watchForAppOpen(1500)
  }

  const status = opened ? 'app_opened' : 'app_open_failed'
  console.log('[AppLauncher] Result:', appKey, status)

  return { opened, status, app: appKey }
}

export async function openPaytmApp() {
  return openAppOnly(UPI_APPS.PAYTM)
}

export async function openPhonePeAppLauncher() {
  return openAppOnly(UPI_APPS.PHONEPE)
}
