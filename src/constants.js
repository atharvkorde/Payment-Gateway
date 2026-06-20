export const DEFAULT_MERCHANT_NAME = 'Atharv Recharge'
export const DEFAULT_UPI_ID = 'YOUR_UPI_ID_HERE'
export const DEFAULT_CURRENCY = 'INR'

export const STORAGE_KEYS = {
  ORDERS: 'upi_tester_orders',
  MERCHANT_NAME: 'upi_tester_merchant_name',
  UPI_ID: 'upi_tester_upi_id',
  DEBUG: 'upi_tester_debug',
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
}

export const UPI_APPS = {
  GOOGLE_PAY: 'google_pay',
  PHONEPE: 'phonepe',
  PAYTM: 'paytm',
  BHIM: 'bhim',
  GENERIC: 'generic',
}

export const UPI_PACKAGES = {
  [UPI_APPS.GOOGLE_PAY]: 'com.google.android.apps.nbu.paisa.user',
  [UPI_APPS.PHONEPE]: 'com.phonepe.app',
  [UPI_APPS.PAYTM]: 'net.one97.paytm',
  [UPI_APPS.BHIM]: 'in.org.npci.upiapp',
}
