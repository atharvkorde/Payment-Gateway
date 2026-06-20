import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { detectDevice, getDeviceLabel } from '../utils/device'
import { detectInstalledApps } from '../utils/intent'
import { FLOW_TYPES } from '../utils/paymentFlow'
import { saveDebugState, getDebugState } from '../utils/storage'

const DebugContext = createContext(null)

export function DebugProvider({ children }) {
  const device = detectDevice()
  const saved = getDebugState()
  const installedApps = detectInstalledApps()

  const [debug, setDebug] = useState({
    deviceType: getDeviceLabel(device),
    browser: device.browser,
    browserKey: device.browserKey,
    androidVersion: device.androidVersion || 'N/A',
    generatedUpiUrl: saved?.generatedUpiUrl || '',
    intentUrl: saved?.intentUrl || '',
    lastClickedApp: saved?.lastClickedApp || 'None',
    intentLaunchStatus: saved?.intentLaunchStatus || 'None',
    testMode: saved?.testMode || null,
    flowType: saved?.flowType || 'None',
    flowStatus: saved?.flowStatus || null,
    lastLaunchTime: saved?.lastLaunchTime || null,
    installedApps,
    launchHistory: saved?.launchHistory || [],
  })

  const logDebug = useCallback((updates) => {
    setDebug((prev) => {
      const next = { ...prev, ...updates }
      console.log('[Debug Panel]', next)
      saveDebugState(next)
      return next
    })
  }, [])

  const logLaunch = useCallback((result) => {
    setDebug((prev) => {
      const entry = {
        app: result.app || result.lastClickedApp,
        status: result.testMode || result.intentLaunchStatus,
        flowType: result.flowType || FLOW_TYPES[result.app] || prev.flowType,
        timestamp: result.timestamp || new Date().toISOString(),
      }
      const launchHistory = [entry, ...(prev.launchHistory || [])].slice(0, 10)

      const next = {
        ...prev,
        generatedUpiUrl: result.paymentLink || result.upiUrl || result.generatedUpiUrl || prev.generatedUpiUrl,
        intentUrl: result.intentUrl || prev.intentUrl,
        lastClickedApp: result.app || result.lastClickedApp || prev.lastClickedApp,
        intentLaunchStatus: result.intentLaunchStatus || result.testMode || prev.intentLaunchStatus,
        testMode: result.testMode || prev.testMode,
        flowType: result.flowType || FLOW_TYPES[result.app] || prev.flowType,
        flowStatus: result.flowStatus || prev.flowStatus,
        lastLaunchTime: result.timestamp || new Date().toISOString(),
        launchHistory,
        installedApps: detectInstalledApps(),
      }

      console.log('[Debug Panel] Launch:', next)
      saveDebugState(next)
      return next
    })
  }, [])

  useEffect(() => {
    console.log('[Device Info]', device)
    console.log('[Installed Apps]', installedApps)
    console.log('[Debug Panel] Initialized')
  }, [])

  return (
    <DebugContext.Provider value={{ debug, logDebug, logLaunch, device }}>
      {children}
    </DebugContext.Provider>
  )
}

export function useDebug() {
  const ctx = useContext(DebugContext)
  if (!ctx) throw new Error('useDebug must be used within DebugProvider')
  return ctx
}
