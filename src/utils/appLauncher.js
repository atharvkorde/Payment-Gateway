import { UPI_APPS, UPI_PACKAGES } from '../constants'
import { detectDevice } from './device'

/**
 * Build Android launcher intent — opens app home screen by package.
 * No S.browser_fallback_url — will NOT redirect to Play Store on failure.
 *
 * Format verified for Chrome Android:
 * intent://#Intent;package=...;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end
 */
export function buildLauncherIntent(packageName) {
  return `intent://#Intent;package=${packageName};action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`
}

const APP_PACKAGES = {
  [UPI_APPS.PAYTM]: UPI_PACKAGES[UPI_APPS.PAYTM],
  [UPI_APPS.PHONEPE]: UPI_PACKAGES[UPI_APPS.PHONEPE],
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

/**
 * Launch a single intent URL via anchor click (preserves user gesture).
 * Does NOT use window.location to avoid unintended navigation.
 */
function launchIntentUrl(launcherUrl) {
  console.log('[AppLauncher] Intent URL:', launcherUrl)

  const anchor = document.createElement('a')
  anchor.href = launcherUrl
  anchor.style.display = 'none'
  anchor.setAttribute('rel', 'noopener')
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}

/**
 * Open a UPI app via launcher intent only.
 * Single attempt — no scheme fallbacks, no Play Store redirect.
 */
export async function openAppOnly(appKey) {
  const device = detectDevice()
  const packageName = APP_PACKAGES[appKey]

  if (!packageName) {
    console.warn('[AppLauncher] Unknown app:', appKey)
    return { opened: false, status: 'unknown_app', launcherUrl: null }
  }

  const launcherUrl = buildLauncherIntent(packageName)

  if (!device.isAndroid) {
    console.log('[AppLauncher] Not Android — cannot open app')
    return { opened: false, status: 'not_android', launcherUrl, app: appKey }
  }

  console.log('[AppLauncher] Opening app (launcher only, no Play Store fallback):', appKey, packageName)

  launchIntentUrl(launcherUrl)

  const opened = await watchForAppOpen(2500)
  const status = opened ? 'app_opened' : 'app_launch_failed'

  console.log('[AppLauncher] Result:', appKey, status, '| URL:', launcherUrl)

  return {
    opened,
    status,
    app: appKey,
    packageName,
    launcherUrl,
    launchFailed: !opened,
  }
}

export async function openPaytmApp() {
  return openAppOnly(UPI_APPS.PAYTM)
}

export async function openPhonePeAppLauncher() {
  return openAppOnly(UPI_APPS.PHONEPE)
}
