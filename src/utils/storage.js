import { DEFAULT_CURRENCY, STORAGE_KEYS, ORDER_STATUS } from '../constants'

export function generateOrderId() {
  const orders = getOrders()
  const year = new Date().getFullYear()
  const seq = String(orders.length + 1).padStart(6, '0')
  return `ORD-${year}-${seq}`
}

export function generateTransactionNote(customerName, orderId) {
  return `Payment by ${customerName} - ${orderId}`
}

export function createOrder({ merchantName, upiId, amount, customerName }) {
  const orderId = generateOrderId()
  const transactionNote = generateTransactionNote(customerName, orderId)

  const order = {
    id: orderId,
    merchantName,
    upiId,
    amount,
    currency: DEFAULT_CURRENCY,
    customerName,
    transactionNote,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  saveOrder(order)
  savePreferences({ merchantName, upiId })

  return order
}

export function getOrders() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function getOrderById(orderId) {
  return getOrders().find((o) => o.id === orderId) || null
}

export function saveOrder(order) {
  const orders = getOrders()
  const index = orders.findIndex((o) => o.id === order.id)
  if (index >= 0) {
    orders[index] = { ...orders[index], ...order, updatedAt: new Date().toISOString() }
  } else {
    orders.unshift(order)
  }
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
}

export function updateOrderStatus(orderId, status) {
  const order = getOrderById(orderId)
  if (!order) return null
  const updated = { ...order, status, updatedAt: new Date().toISOString() }
  saveOrder(updated)
  return updated
}

export function savePreferences({ merchantName, upiId }) {
  if (merchantName) {
    localStorage.setItem(STORAGE_KEYS.MERCHANT_NAME, merchantName)
  }
  if (upiId) {
    localStorage.setItem(STORAGE_KEYS.UPI_ID, upiId)
  }
}

export function getPreferences() {
  return {
    merchantName: localStorage.getItem(STORAGE_KEYS.MERCHANT_NAME) || '',
    upiId: localStorage.getItem(STORAGE_KEYS.UPI_ID) || '',
  }
}

export function getOrderStats() {
  const orders = getOrders()
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === ORDER_STATUS.PENDING).length,
    success: orders.filter((o) => o.status === ORDER_STATUS.SUCCESS).length,
    failed: orders.filter((o) => o.status === ORDER_STATUS.FAILED).length,
  }
}

export function clearAllOrders() {
  localStorage.removeItem(STORAGE_KEYS.ORDERS)
}

export function saveDebugState(debug) {
  try {
    localStorage.setItem(STORAGE_KEYS.DEBUG, JSON.stringify(debug))
  } catch {
    /* ignore quota errors */
  }
}

export function getDebugState() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DEBUG)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}
