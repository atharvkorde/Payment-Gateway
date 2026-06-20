export function GooglePayIcon({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="white" />
      <path
        d="M24 14c-3.5 0-6.5 1.2-8.9 3.2l-3.3-3.3C14.8 11.2 19.2 9 24 9c5.8 0 10.9 3 13.8 7.6l-3.3 2.5C32.4 16.2 28.5 14 24 14z"
        fill="#EA4335"
      />
      <path
        d="M14.1 24c0-1.4.2-2.7.7-3.9l-3.3-2.5C10.3 19.8 10 21.8 10 24s.3 4.2.5 6.4l3.3-2.5c-.5-1.2-.7-2.5-.7-3.9z"
        fill="#FBBC05"
      />
      <path
        d="M24 34c-4.5 0-8.4-2.2-10.8-5.6l3.3-2.5c1.5 2 3.9 3.3 6.5 3.3 2.5 0 4.6-1 6-2.6l3.3 2.5C34.9 31 29.8 34 24 34z"
        fill="#34A853"
      />
      <path
        d="M38.8 22.5H24v5.5h8.4c-.4 2.1-1.6 3.9-3.3 5.1l3.3 2.5c2.9-2.7 4.6-6.7 4.6-11.1 0-1-.1-2-.3-3z"
        fill="#4285F4"
      />
    </svg>
  )
}

export function PhonePeIcon({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#5f259f" />
      <path
        d="M24 10c-7.7 0-14 6.3-14 14s6.3 14 14 14 14-6.3 14-14-6.3-14-14-14zm0 4c2.8 0 5.3 1.1 7.2 2.9L24 24V14zm-7.2 2.9C18.7 15.1 21.2 14 24 14v10l-7.2-7.1z"
        fill="white"
      />
      <path d="M24 24l7.2 7.1C29.3 32.9 26.8 34 24 34c-5.5 0-10-4.5-10-10 0-2.8 1.1-5.3 2.9-7.2L24 24z" fill="white" opacity="0.7" />
    </svg>
  )
}

export function PaytmIcon({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#002e6e" />
      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial,sans-serif">
        Paytm
      </text>
      <path d="M14 18h20v2H14z" fill="#00baf2" />
    </svg>
  )
}

export function BhimIcon({ className = 'w-10 h-10' }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="12" fill="#00897b" />
      <path
        d="M24 12c-6.6 0-12 5.4-12 12s5.4 12 12 12 12-5.4 12-12-5.4-12-12-12zm0 4c1.5 0 2.9.4 4.1 1.1L24 24V16zm-4.1 1.1C20.9 16.4 22.5 16 24 16v8l-4.1-6.9z"
        fill="white"
      />
      <text x="24" y="34" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial,sans-serif">
        BHIM
      </text>
    </svg>
  )
}

const ICON_MAP = {
  google_pay: GooglePayIcon,
  phonepe: PhonePeIcon,
  paytm: PaytmIcon,
  bhim: BhimIcon,
}

export function UpiAppIcon({ appKey, className }) {
  const Icon = ICON_MAP[appKey]
  if (!Icon) return null
  return <Icon className={className} />
}
