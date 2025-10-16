import { ref, onMounted, onUnmounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'

export function useBarcodeScanner(addProduct) {
  const productsStore = useProductsStore()
  const ordersStore = useOrdersStore()

  const barcodeBuffer = ref('')
  const barcodeTimeout = ref(null)

  const handleKeyPress = (e) => {
    const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement

    // F1: Open payment
    if (e.key === 'F1' && ordersStore.currentOrder.length > 0) {
      e.preventDefault()
      return 'payment'
    }

    if (inInput) return

    // ESC: Cancel order
    if (e.key === 'Escape') {
      e.preventDefault()
      return 'cancel'
    }

    // Clear previous timeout
    if (barcodeTimeout.value) {
      clearTimeout(barcodeTimeout.value)
    }

    // Enter: Process barcode
    if (e.key === 'Enter' && barcodeBuffer.value) {
      e.preventDefault()
      const barcode = barcodeBuffer.value
      barcodeBuffer.value = ''

      const product = productsStore.products.find(p => p.barcode === barcode)
      if (product) {
        addProduct(product)
      }
      return
    }

    // Accumulate barcode digits
    if (e.key.length === 1 && /[0-9]/.test(e.key)) {
      barcodeBuffer.value += e.key

      barcodeTimeout.value = window.setTimeout(() => {
        barcodeBuffer.value = ''
      }, 100)
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyPress)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyPress)
    if (barcodeTimeout.value) {
      clearTimeout(barcodeTimeout.value)
    }
  })

  return {
    barcodeBuffer,
    handleKeyPress
  }
}
