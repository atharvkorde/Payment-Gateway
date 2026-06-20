import { useState } from 'react'
import { useDebug } from '../hooks/useDebug'

export default function DebugPanel({ defaultExpanded = false }) {
  const { debug } = useDebug()
  const [expanded, setExpanded] = useState(defaultExpanded)

  const installedSummary = (debug.installedApps || [])
    .map((a) => `${a.name}: ${a.installed}`)
    .join(' | ')

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-gray-700 bg-gray-900 text-gray-100">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          🛠 Deep Debug Panel
        </span>
        <span className="rounded bg-gray-800 px-2 py-0.5 text-[10px] text-green-400">
          {debug.testMode || 'idle'}
        </span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-gray-700 px-4 py-3 font-mono text-[11px] leading-relaxed">
          <Section title="Device">
            <Row label="Device" value={debug.deviceType} />
            <Row label="Android" value={debug.androidVersion} />
            <Row label="Browser" value={`${debug.browser} (${debug.browserKey})`} />
          </Section>

          <Section title="App Detection">
            {(debug.installedApps || []).map((app) => (
              <Row
                key={app.key}
                label={app.name}
                value={app.installed}
                valueClass={
                  app.installed === 'likely_installed'
                    ? 'text-green-400'
                    : app.installed === 'likely_not_installed'
                      ? 'text-red-400'
                      : 'text-gray-400'
                }
              />
            ))}
            {installedSummary && (
              <p className="break-all text-[10px] text-gray-500">{installedSummary}</p>
            )}
          </Section>

          <Section title="Launch">
            <Row label="Last App" value={debug.lastClickedApp} />
            <Row label="Status" value={debug.intentLaunchStatus} />
            <Row label="Test Mode" value={debug.testMode || '—'} highlight />
            {debug.lastLaunchTime && (
              <Row label="Time" value={new Date(debug.lastLaunchTime).toLocaleTimeString()} />
            )}
          </Section>

          <Section title="URLs">
            <div>
              <p className="text-gray-500">UPI Link:</p>
              <p className="mt-0.5 break-all text-green-400">{debug.generatedUpiUrl || '—'}</p>
            </div>
            <div className="mt-2">
              <p className="text-gray-500">Intent URL:</p>
              <p className="mt-0.5 break-all text-blue-400">{debug.intentUrl || '—'}</p>
            </div>
          </Section>

          {(debug.launchHistory || []).length > 0 && (
            <Section title="History">
              {debug.launchHistory.map((h, i) => (
                <p key={i} className="text-[10px] text-gray-400">
                  [{new Date(h.timestamp).toLocaleTimeString()}] {h.app} → {h.status}
                </p>
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Row({ label, value, valueClass = 'text-gray-200', highlight }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className={`truncate text-right ${highlight ? 'font-bold text-yellow-400' : valueClass}`}>
        {value}
      </span>
    </div>
  )
}
