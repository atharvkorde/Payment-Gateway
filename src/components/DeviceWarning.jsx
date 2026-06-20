import { detectDevice } from '../utils/device'

export default function DeviceWarning() {
  const device = detectDevice()

  if (!device.isDesktop) return null

  return (
    <div className="mb-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="text-sm font-semibold text-amber-800">Desktop Detected</p>
        <p className="mt-0.5 text-xs leading-relaxed text-amber-700">
          UPI Intent works best on Android devices with installed UPI apps. Open this page on
          your Android phone to test app launching.
        </p>
      </div>
    </div>
  )
}
