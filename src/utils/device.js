export function detectDevice() {
  const ua = navigator.userAgent || ''
  const isAndroid = /android/i.test(ua)
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isMobile = isAndroid || isIOS || /mobile/i.test(ua)
  const isDesktop = !isMobile

  let androidVersion = null
  const androidMatch = ua.match(/Android\s([0-9.]+)/i)
  if (androidMatch) {
    androidVersion = androidMatch[1]
  }

  let deviceType = 'desktop'
  if (isAndroid) deviceType = 'android'
  else if (isIOS) deviceType = 'iphone'

  const browser = detectBrowser(ua)

  return {
    isAndroid,
    isIOS,
    isMobile,
    isDesktop,
    deviceType,
    androidVersion,
    browser,
    browserKey: getBrowserKey(ua),
    userAgent: ua,
  }
}

function detectBrowser(ua) {
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet'
  if (/brave/i.test(ua)) return 'Brave'
  if (/edg/i.test(ua)) return 'Edge'
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'Chrome'
  if (/firefox/i.test(ua)) return 'Firefox'
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari'
  if (/opr/i.test(ua)) return 'Opera'
  return 'Unknown'
}

function getBrowserKey(ua) {
  if (/samsungbrowser/i.test(ua)) return 'samsung'
  if (/brave/i.test(ua)) return 'brave'
  if (/edg/i.test(ua)) return 'edge'
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) return 'chrome'
  if (/firefox/i.test(ua)) return 'firefox'
  return 'unknown'
}

export function getDeviceLabel(device) {
  switch (device.deviceType) {
    case 'android':
      return `Android${device.androidVersion ? ` ${device.androidVersion}` : ''}`
    case 'iphone':
      return 'iPhone / iOS'
    default:
      return 'Desktop'
  }
}

/**
 * Browser-specific launch strategies for Android UPI intents.
 * All strategies execute synchronously within user gesture.
 */
export function getBrowserLaunchStrategy() {
  const device = detectDevice()
  const key = device.browserKey

  const strategies = {
    chrome: {
      name: 'Chrome Android',
      launch(url) {
        const a = document.createElement('a')
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      },
    },
    samsung: {
      name: 'Samsung Internet',
      launch(url) {
        // Samsung Internet handles intent:// well via location
        window.location.href = url
      },
    },
    brave: {
      name: 'Brave Android',
      launch(url) {
        const a = document.createElement('a')
        a.href = url
        a.target = '_self'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      },
    },
    edge: {
      name: 'Edge Android',
      launch(url) {
        window.location.assign(url)
      },
    },
    firefox: {
      name: 'Firefox Android',
      launch(url) {
        window.location.href = url
      },
    },
    unknown: {
      name: 'Default',
      launch(url) {
        const a = document.createElement('a')
        a.href = url
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        setTimeout(() => {
          try {
            window.location.href = url
          } catch {
            /* ignore */
          }
        }, 300)
      },
    },
  }

  if (!device.isAndroid) {
    return {
      name: 'Desktop/iOS',
      launch(url) {
        const upiUrl = url.replace(/^intent:\/\//, 'upi://').split('#Intent')[0]
        window.open(upiUrl, '_blank')
      },
    }
  }

  return strategies[key] || strategies.unknown
}
