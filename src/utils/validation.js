const UPI_ID_REGEX = /^[\w.\-]+@[\w.\-]+$/

export function validateUpiId(upiId) {
  if (!upiId || !upiId.trim()) {
    return { valid: false, error: 'UPI ID is required' }
  }
  const trimmed = upiId.trim().toLowerCase()
  if (!UPI_ID_REGEX.test(trimmed)) {
    return { valid: false, error: 'Invalid UPI ID format (e.g. name@upi)' }
  }
  return { valid: true, value: trimmed }
}

export function validateAmount(amount) {
  const num = parseFloat(amount)
  if (!amount || amount.toString().trim() === '') {
    return { valid: false, error: 'Amount is required' }
  }
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' }
  }
  if (num > 100000) {
    return { valid: false, error: 'Amount cannot exceed ₹1,00,000' }
  }
  return { valid: true, value: num.toFixed(2) }
}

export function validateMerchantName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Merchant name is required' }
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Merchant name must be at least 2 characters' }
  }
  return { valid: true, value: name.trim() }
}

export function validateCustomerName(name) {
  if (!name || !name.trim()) {
    return { valid: false, error: 'Customer name is required' }
  }
  return { valid: true, value: name.trim() }
}

export function validateOrderForm({ merchantName, upiId, amount, customerName }) {
  const errors = {}
  const merchant = validateMerchantName(merchantName)
  const upi = validateUpiId(upiId)
  const amt = validateAmount(amount)
  const customer = validateCustomerName(customerName)

  if (!merchant.valid) errors.merchantName = merchant.error
  if (!upi.valid) errors.upiId = upi.error
  if (!amt.valid) errors.amount = amt.error
  if (!customer.valid) errors.customerName = customer.error

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    values: {
      merchantName: merchant.valid ? merchant.value : merchantName,
      upiId: upi.valid ? upi.value : upiId,
      amount: amt.valid ? amt.value : amount,
      customerName: customer.valid ? customer.value : customerName,
    },
  }
}
