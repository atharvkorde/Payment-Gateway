import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/admin', label: 'Admin', icon: '📊' },
]

export default function Layout({ children }) {
  const location = useLocation()

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              TZ
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">TezGateway</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                UPI Intent Tester
              </p>
            </div>
          </Link>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
            Test Only
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-5">{children}</main>

      <nav className="sticky bottom-0 border-t border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg">
          {navItems.map(({ path, label, icon }) => {
            const active = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                  active ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
