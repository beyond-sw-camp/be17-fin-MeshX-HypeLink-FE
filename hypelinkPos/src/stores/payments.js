import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePaymentsStore = defineStore('payments', () => {
  const payments = ref([])
  const isProcessing = ref(false)

  const processPayment = async (orderId, amount, method) => {
    isProcessing.value = true

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))

    const payment = {
      id: `PAY${Date.now()}`,
      orderId,
      amount,
      method,
      status: 'completed',
      createdAt: new Date()
    }

    payments.value.unshift(payment)
    isProcessing.value = false

    return payment
  }

  const getPaymentsByOrderId = (orderId) => {
    return payments.value.filter(p => p.orderId === orderId)
  }

  const getTodayTotal = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return payments.value
      .filter(p => {
        const paymentDate = new Date(p.createdAt)
        paymentDate.setHours(0, 0, 0, 0)
        return paymentDate.getTime() === today.getTime() && p.status === 'completed'
      })
      .reduce((sum, p) => sum + p.amount, 0)
  }

  const getPaymentStats = () => {
    const completed = payments.value.filter(p => p.status === 'completed')

    const byMethod = {
      cash: completed.filter(p => p.method === 'cash').length,
      card: completed.filter(p => p.method === 'card').length,
      qr: completed.filter(p => p.method === 'qr').length,
      transfer: completed.filter(p => p.method === 'transfer').length
    }

    const total = completed.reduce((sum, p) => sum + p.amount, 0)

    return { byMethod, total, count: completed.length }
  }

  return {
    payments,
    isProcessing,
    processPayment,
    getPaymentsByOrderId,
    getTodayTotal,
    getPaymentStats
  }
})