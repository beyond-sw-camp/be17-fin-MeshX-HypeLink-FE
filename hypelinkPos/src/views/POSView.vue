<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import { usePaymentsStore } from '@/stores/payments'
import { useMembershipStore } from '@/stores/membership'
import { useCouponsStore } from '@/stores/coupons'
import PaymentModal from '@/components/PaymentModal.vue'
import NumberKeypad from '@/components/NumberKeypad.vue'
import TextKeypad from '@/components/TextKeypad.vue'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()
const paymentsStore = usePaymentsStore()
const membershipStore = useMembershipStore()
const couponsStore = useCouponsStore()

const selectedCategory = ref('all')
const searchQuery = ref('')
const showPaymentModal = ref(false)
const showHeldOrders = ref(false)
const barcodeBuffer = ref('')
const barcodeTimeout = ref(null)
const isEditMode = ref(false)
const showAddProductModal = ref(false)
const selectedSlot = ref(null)
const currentPage = ref(0)

const totalSlots = 24 // 6 x 4 grid
const slotsPerPage = 24

const totalPages = computed(() => {
  // posSlots에서 가장 큰 슬롯 인덱스 찾기
  const slotIndices = Object.keys(productsStore.posSlots).map(Number)
  if (slotIndices.length === 0) return 1

  const maxSlotIndex = Math.max(...slotIndices)
  return Math.ceil((maxSlotIndex + 1) / slotsPerPage)
})

const productSlots = computed(() => {
  const slots = Array(totalSlots).fill(null)

  // posSlots에서 각 슬롯에 할당된 상품 가져오기
  for (let i = 0; i < totalSlots; i++) {
    const slotIndex = currentPage.value * slotsPerPage + i
    const product = productsStore.getProductBySlot(slotIndex)
    if (product) {
      // 카테고리 필터링 적용
      if (selectedCategory.value === 'all' || product.category === selectedCategory.value) {
        // 검색 필터링 적용
        if (!searchQuery.value) {
          slots[i] = product
        } else {
          const query = searchQuery.value.toLowerCase()
          if (product.name.toLowerCase().includes(query) || product.barcode?.includes(query)) {
            slots[i] = product
          }
        }
      }
    }
  }

  return slots
})

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
}

const openAddProduct = (slotIndex) => {
  if (isEditMode.value) {
    selectedSlot.value = slotIndex
    showAddProductModal.value = true
  }
}

const removeProductFromSlot = (slotIndex) => {
  if (!isEditMode.value) return

  const absoluteSlotIndex = currentPage.value * slotsPerPage + slotIndex
  const product = productsStore.getProductBySlot(absoluteSlotIndex)

  if (product && confirm(`${product.name}을(를) POS 화면에서 제거하시겠습니까?`)) {
    productsStore.removeProductFromSlot(absoluteSlotIndex)
  }
}

const closeAddProductModal = () => {
  showAddProductModal.value = false
  selectedSlot.value = null
}

const selectedProductForPrice = ref(null)
const showPriceModal = ref(false)
const customPrice = ref('')
const showDiscountModal = ref(false)
const discountType = ref('amount') // 'amount' or 'percent'
const discountValue = ref('')
const selectedDiscountItems = ref([]) // 선택된 품목 ID 배열

// 멤버십 관련
const memberPhone = ref('')
const currentMember = ref(null)
const showMembershipRegisterModal = ref(false)
const newMemberName = ref('')
const newMemberPhone = ref('')
const newMemberBirthdate = ref('')
const showPhoneKeypad = ref(false)
const showRegisterPhoneKeypad = ref(false)
const showNameKeypad = ref(false)

const openPhoneKeypad = () => {
  showPhoneKeypad.value = true
}

const confirmPhoneSearch = (phone) => {
  memberPhone.value = phone
  showPhoneKeypad.value = false

  if (phone.length < 10) {
    alert('올바른 전화번호를 입력해주세요.')
    return
  }

  const member = membershipStore.findMemberByPhone(phone)
  if (member) {
    currentMember.value = member
    alert(`${member.name}님 환영합니다!\n보유 포인트: ${member.points.toLocaleString()}P`)
  } else {
    if (confirm('등록되지 않은 회원입니다.\n멤버십에 가입하시겠습니까?')) {
      newMemberPhone.value = phone
      showMembershipRegisterModal.value = true
    }
  }
}

const searchMember = () => {
  if (memberPhone.value.length < 10) {
    alert('올바른 전화번호를 입력해주세요.')
    return
  }

  const member = membershipStore.findMemberByPhone(memberPhone.value)
  if (member) {
    currentMember.value = member
    alert(`${member.name}님 환영합니다!\n보유 포인트: ${member.points.toLocaleString()}P`)
  } else {
    if (confirm('등록되지 않은 회원입니다.\n멤버십에 가입하시겠습니까?')) {
      newMemberPhone.value = memberPhone.value
      showMembershipRegisterModal.value = true
    }
  }
}

const openRegisterPhoneKeypad = () => {
  showRegisterPhoneKeypad.value = true
}

const confirmRegisterPhone = (phone) => {
  newMemberPhone.value = phone
  showRegisterPhoneKeypad.value = false
}

const openNameKeypad = () => {
  showNameKeypad.value = true
}

const confirmNameInput = (name) => {
  newMemberName.value = name
  showNameKeypad.value = false
}

const registerMember = () => {
  if (!newMemberName.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }

  if (newMemberPhone.value.length < 10) {
    alert('올바른 전화번호를 입력해주세요.')
    return
  }

  if (!newMemberBirthdate.value) {
    alert('생년월일을 입력해주세요.')
    return
  }

  const result = membershipStore.registerMember(newMemberName.value, newMemberPhone.value, newMemberBirthdate.value)
  if (result.success) {
    currentMember.value = result.member
    memberPhone.value = newMemberPhone.value
    alert(`${result.member.name}님, 멤버십 가입을 환영합니다!`)
    showMembershipRegisterModal.value = false
    newMemberName.value = ''
    newMemberPhone.value = ''
    newMemberBirthdate.value = ''
  } else {
    alert(result.message)
  }
}

const clearMember = () => {
  currentMember.value = null
  memberPhone.value = ''
}

const openDiscountModal = () => {
  if (ordersStore.currentOrder.length === 0) return
  showDiscountModal.value = true
  discountType.value = 'amount'
  discountValue.value = ''
  selectedDiscountItems.value = []
}

const closeDiscountModal = () => {
  showDiscountModal.value = false
  discountValue.value = ''
  selectedDiscountItems.value = []
}

const toggleDiscountItem = (productId) => {
  const index = selectedDiscountItems.value.indexOf(productId)
  if (index > -1) {
    selectedDiscountItems.value.splice(index, 1)
  } else {
    selectedDiscountItems.value.push(productId)
  }
}

const isItemSelected = (productId) => {
  return selectedDiscountItems.value.includes(productId)
}

const appendNumber = (num) => {
  discountValue.value += num.toString()
}

const appendDoubleZero = () => {
  discountValue.value += '00'
}

const deleteLastDigit = () => {
  discountValue.value = discountValue.value.slice(0, -1)
}

const selectAllItems = () => {
  selectedDiscountItems.value = ordersStore.currentOrder.map(item => item.productId)
}

const applyDiscount = () => {
  const value = parseInt(discountValue.value)
  if (!value || value <= 0) {
    alert('할인 금액/비율을 입력해주세요.')
    return
  }

  if (discountType.value === 'percent' && value > 100) {
    alert('할인율은 100%를 초과할 수 없습니다.')
    return
  }

  // 총 할인 (모든 품목)
  if (selectedDiscountItems.value.length === 0) {
    ordersStore.currentOrder.forEach(item => {
      applyDiscountToItem(item.productId, value)
    })
  } else {
    // 선택된 품목만 할인
    selectedDiscountItems.value.forEach(productId => {
      applyDiscountToItem(productId, value)
    })
  }

  closeDiscountModal()
}

const applyDiscountToItem = (productId, value) => {
  const item = ordersStore.currentOrder.find(i => i.productId === productId)
  if (!item) return

  let discountAmount = 0
  if (discountType.value === 'amount') {
    discountAmount = value
  } else {
    // percent
    discountAmount = Math.floor((item.price * item.quantity * value) / 100)
  }

  // 할인 금액이 상품 금액보다 크지 않도록
  const maxDiscount = item.price * item.quantity
  discountAmount = Math.min(discountAmount, maxDiscount)

  // 할인 적용 (실제로는 store에 discount 필드를 추가해야 함)
  // 현재는 간단히 가격 조정
  const newPrice = Math.max(0, Math.floor((item.price * item.quantity - discountAmount) / item.quantity))
  ordersStore.updatePrice(productId, newPrice)
}

const addProductToSlot = (product) => {
  // 가격은 나중에 설정할 수 있으므로 바로 슬롯에 할당
  selectedProductForPrice.value = product
  showAddProductModal.value = false

  // 슬롯에 상품 할당
  const absoluteSlotIndex = currentPage.value * slotsPerPage + selectedSlot.value
  productsStore.assignProductToSlot(absoluteSlotIndex, product.id)

  selectedSlot.value = null
  selectedProductForPrice.value = null
}

const confirmAddProduct = () => {
  const price = parseInt(customPrice.value)
  if (!price || price <= 0) {
    alert('올바른 가격을 입력해주세요.')
    return
  }

  // 실제 구현에서는 여기서 슬롯에 상품을 추가하고 가격을 설정
  // 현재는 간단히 모달만 닫기
  showPriceModal.value = false
  selectedProductForPrice.value = null
  customPrice.value = ''
  closeAddProductModal()
}

// 재고 목록에서 사용 가능한 모든 상품 (중복 제거)
const availableProducts = computed(() => {
  return productsStore.products
})

const filteredProducts = computed(() => {
  let products = productsStore.getProductsByCategory(selectedCategory.value)

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.barcode?.includes(query)
    )
  }

  return products
})

const orderTotal = computed(() => ordersStore.getOrderTotal())

const addProduct = (product) => {
  ordersStore.addToOrder({
    productId: product.id,
    productName: product.name,
    quantity: 1,
    price: product.price,
    subtotal: product.price
  })
}

const updateItemQuantity = (productId, quantity) => {
  ordersStore.updateQuantity(productId, quantity)
}

const removeItem = (productId) => {
  ordersStore.removeFromOrder(productId)
}

const openPayment = () => {
  if (ordersStore.currentOrder.length === 0) return
  showPaymentModal.value = true
}

const handlePaymentComplete = () => {
  showPaymentModal.value = false
}

const cancelOrder = () => {
  if (confirm('주문을 취소하시겠습니까?')) {
    ordersStore.cancelOrder()
  }
}

const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

const holdCurrentOrder = () => {
  const result = ordersStore.holdOrder()
  if (result) {
    alert('주문이 보류되었습니다.')
  }
}

const retrieveHeldOrder = (holdId) => {
  const result = ordersStore.retrieveOrder(holdId)
  if (result) {
    showHeldOrders.value = false
  }
}

const removeHeld = (holdId) => {
  if (confirm('보류 주문을 삭제하시겠습니까?')) {
    ordersStore.removeHeldOrder(holdId)
  }
}

// Keyboard shortcuts and barcode scanner handler
const handleKeyPress = (e) => {
  // Ignore if typing in input fields (except for payment shortcuts)
  const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement

  // F1-F4: Quick payment methods
  if (e.key === 'F1' && ordersStore.currentOrder.length > 0) {
    e.preventDefault()
    showPaymentModal.value = true
    return
  }

  if (inInput) return

  // ESC: Cancel order
  if (e.key === 'Escape') {
    e.preventDefault()
    if (showPaymentModal.value) {
      showPaymentModal.value = false
    } else if (ordersStore.currentOrder.length > 0) {
      cancelOrder()
    }
    return
  }

  // Clear previous timeout
  if (barcodeTimeout.value) {
    clearTimeout(barcodeTimeout.value)
  }

  // Enter key = barcode complete
  if (e.key === 'Enter' && barcodeBuffer.value) {
    e.preventDefault()
    const barcode = barcodeBuffer.value
    barcodeBuffer.value = ''

    // Find product by barcode
    const product = productsStore.products.find(p => p.barcode === barcode)
    if (product) {
      addProduct(product)
    }
    return
  }

  // Accumulate barcode digits
  if (e.key.length === 1 && /[0-9]/.test(e.key)) {
    barcodeBuffer.value += e.key

    // Reset buffer after 100ms of inactivity
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
</script>

<template>
  <div class="pos-view">
    <!-- Left: Products -->
    <div class="products-section">
      <div class="section-header">
        <div class="search-bar">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="상품명 또는 바코드로 검색"
            class="search-input"
          />
        </div>
        <button class="edit-mode-btn" :class="{ active: isEditMode }" @click="toggleEditMode">
          {{ isEditMode ? '완료' : '편집' }}
        </button>
      </div>

      <div class="categories">
        <button
          v-for="category in productsStore.categories"
          :key="category.id"
          class="category-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.name }}
        </button>
      </div>

      <div class="products-grid-wrapper">
        <div class="products-grid">
          <div
            v-for="(product, index) in productSlots"
            :key="index"
            class="product-card"
            :class="{ empty: !product, 'edit-mode': isEditMode }"
            @click="product && !isEditMode ? addProduct(product) : (!product ? openAddProduct(index) : null)"
          >
            <template v-if="product && isEditMode">
              <button class="delete-slot-btn" @click.stop="removeProductFromSlot(index)">✕</button>
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">{{ formatPrice(product.price) }}</div>
              <div class="product-stock">재고: {{ product.stock }}</div>
            </template>
            <template v-else-if="product">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">{{ formatPrice(product.price) }}</div>
              <div class="product-stock">재고: {{ product.stock }}</div>
            </template>
            <template v-else-if="isEditMode">
              <div class="add-product-btn">+</div>
            </template>
          </div>
        </div>

        <div class="pagination">
          <button class="page-btn" :disabled="currentPage === 0" @click="prevPage">
            ◀ 이전
          </button>
          <span class="page-info">{{ currentPage + 1 }} / {{ totalPages }}</span>
          <button class="page-btn" :disabled="currentPage === totalPages - 1" @click="nextPage">
            다음 ▶
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Order -->
    <div class="order-section">
      <!-- Membership Section -->
      <div class="membership-section">
        <div v-if="!currentMember" class="membership-search">
          <input
            v-model="memberPhone"
            type="tel"
            placeholder="전화번호 입력 (멤버십 조회)"
            class="member-phone-input"
            maxlength="11"
            readonly
            @click="openPhoneKeypad"
          />
          <button class="member-search-btn" @click="openPhoneKeypad">조회</button>
        </div>
        <div v-else class="member-info">
          <div class="member-details">
            <span class="member-name">👤 {{ currentMember.name }}</span>
            <span class="member-points">💰 {{ currentMember.points.toLocaleString() }}P</span>
            <span class="member-coupons" v-if="couponsStore.getAvailableCoupons(currentMember.id, 0).length > 0">
              🎟️ {{ couponsStore.getAvailableCoupons(currentMember.id, 0).length }}장
            </span>
          </div>
          <button class="member-clear-btn" @click="clearMember">✕</button>
        </div>
      </div>

      <div class="order-header">
        <h2>주문 내역</h2>
        <div class="order-actions">
          <button
            v-if="ordersStore.heldOrders.length > 0"
            class="held-btn"
            @click="showHeldOrders = true"
          >
            보류 ({{ ordersStore.heldOrders.length }})
          </button>
          <button
            v-if="ordersStore.currentOrder.length > 0"
            class="hold-btn"
            @click="holdCurrentOrder"
          >
            보류
          </button>
          <button
            v-if="ordersStore.currentOrder.length > 0"
            class="clear-btn"
            @click="cancelOrder"
          >
            취소
          </button>
        </div>
      </div>

      <div class="order-items">
        <div v-if="ordersStore.currentOrder.length === 0" class="empty-order">
          상품을 선택해주세요
        </div>

        <div
          v-for="item in ordersStore.currentOrder"
          :key="item.productId"
          class="order-item"
        >
          <div class="item-info">
            <div class="item-name">{{ item.productName }}</div>
            <div class="item-price">{{ formatPrice(item.price) }}</div>
          </div>

          <div class="item-controls">
            <button
              class="qty-btn"
              @click="updateItemQuantity(item.productId, item.quantity - 1)"
            >
              -
            </button>
            <span class="qty">{{ item.quantity }}</span>
            <button
              class="qty-btn"
              @click="updateItemQuantity(item.productId, item.quantity + 1)"
            >
              +
            </button>
            <button class="remove-btn" @click="removeItem(item.productId)">삭제</button>
          </div>

          <div class="item-subtotal">{{ formatPrice(item.subtotal) }}</div>
        </div>
      </div>

      <div class="order-summary">
        <div class="summary-row">
          <span>상품 수</span>
          <span>{{ ordersStore.currentOrder.length }}개</span>
        </div>
        <div class="summary-row total">
          <span>총 금액</span>
          <span class="total-amount">{{ formatPrice(orderTotal) }}</span>
        </div>
      </div>

      <button
        class="discount-btn"
        :disabled="ordersStore.currentOrder.length === 0"
        @click="openDiscountModal"
      >
        할인
      </button>

      <button
        class="payment-btn"
        :disabled="ordersStore.currentOrder.length === 0"
        @click="openPayment"
      >
        결제하기
      </button>
    </div>

    <PaymentModal
      v-if="showPaymentModal"
      :total="orderTotal"
      :member="currentMember"
      @close="showPaymentModal = false"
      @complete="handlePaymentComplete"
    />

    <!-- Held Orders Modal -->
    <div v-if="showHeldOrders" class="held-modal-overlay" @click="showHeldOrders = false">
      <div class="held-modal-content" @click.stop>
        <div class="held-modal-header">
          <h2>보류된 주문</h2>
          <button class="close-btn" @click="showHeldOrders = false">✕</button>
        </div>

        <div class="held-orders-list">
          <div
            v-for="held in ordersStore.heldOrders"
            :key="held.id"
            class="held-order-card"
          >
            <div class="held-order-info">
              <div class="held-order-id">{{ held.id }}</div>
              <div class="held-order-time">
                {{ new Date(held.timestamp).toLocaleTimeString('ko-KR') }}
              </div>
              <div class="held-order-items">
                {{ held.items.length }}개 상품 ·
                {{ formatPrice(held.items.reduce((sum, item) => sum + item.subtotal, 0)) }}
              </div>
            </div>
            <div class="held-order-actions">
              <button class="retrieve-btn" @click="retrieveHeldOrder(held.id)">
                회수
              </button>
              <button class="delete-held-btn" @click="removeHeld(held.id)">
                삭제
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddProductModal" class="modal-overlay" @click="closeAddProductModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>품목 추가</h2>
          <button class="close-btn" @click="closeAddProductModal">✕</button>
        </div>

        <div class="modal-body">
          <div class="product-select-grid">
            <div
              v-for="product in availableProducts"
              :key="product.id"
              class="product-select-card"
              @click="addProductToSlot(product)"
            >
              <div class="product-select-name">{{ product.name }}</div>
              <div class="product-select-price">{{ formatPrice(product.price) }}</div>
              <div class="product-select-stock">재고: {{ product.stock }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Price Setting Modal -->
    <div v-if="showPriceModal" class="modal-overlay" @click="showPriceModal = false">
      <div class="price-modal-content" @click.stop>
        <div class="modal-header">
          <h2>가격 설정</h2>
          <button class="close-btn" @click="showPriceModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="price-form">
            <div class="selected-product-info">
              <div class="product-info-name">{{ selectedProductForPrice?.name }}</div>
              <div class="product-info-default">기본 가격: {{ formatPrice(selectedProductForPrice?.price || 0) }}</div>
            </div>

            <div class="form-group">
              <label>판매 가격 <span class="required">*</span></label>
              <input
                v-model="customPrice"
                type="number"
                placeholder="가격을 입력하세요"
                class="price-input"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showPriceModal = false">취소</button>
          <button class="confirm-btn" @click="confirmAddProduct">추가</button>
        </div>
      </div>
    </div>

    <!-- Membership Register Modal -->
    <div v-if="showMembershipRegisterModal" class="modal-overlay">
      <div class="membership-register-modal" @click.stop>
        <div class="modal-header">
          <h2>멤버십 가입</h2>
          <button class="close-btn" @click="showMembershipRegisterModal = false">✕</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>이름</label>
            <input
              v-model="newMemberName"
              type="text"
              placeholder="이름 입력"
              class="form-input"
              readonly
              @click="openNameKeypad"
            />
          </div>

          <div class="form-group">
            <label>전화번호</label>
            <input
              v-model="newMemberPhone"
              type="tel"
              placeholder="전화번호 입력"
              maxlength="11"
              class="form-input"
              readonly
              @click="openRegisterPhoneKeypad"
            />
          </div>

          <div class="form-group">
            <label>생년월일</label>
            <input
              v-model="newMemberBirthdate"
              type="date"
              placeholder="생년월일 선택"
              class="form-input date-input"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="showMembershipRegisterModal = false">
            취소
          </button>
          <button class="confirm-btn" @click="registerMember">가입</button>
        </div>
      </div>
    </div>

    <!-- Discount Modal -->
    <div v-if="showDiscountModal" class="modal-overlay">
      <div class="discount-modal-content" @click.stop>
        <div class="modal-header">
          <h2>할인</h2>
          <button class="close-btn" @click="closeDiscountModal">✕</button>
        </div>

        <div class="discount-modal-body">
          <!-- Left: Keypad and Input -->
          <div class="discount-left">
            <div class="discount-type-selector">
              <button
                class="type-btn"
                :class="{ active: discountType === 'amount' }"
                @click="discountType = 'amount'"
              >
                금액 (원)
              </button>
              <button
                class="type-btn"
                :class="{ active: discountType === 'percent' }"
                @click="discountType = 'percent'"
              >
                비율 (%)
              </button>
            </div>

            <div class="discount-input-display">
              <input
                v-model="discountValue"
                type="text"
                readonly
                :placeholder="discountType === 'amount' ? '금액 입력' : '비율 입력'"
                class="discount-display"
              />
              <span class="discount-unit">{{ discountType === 'amount' ? '원' : '%' }}</span>
            </div>

            <div class="keypad">
              <button class="key-btn" @click="appendNumber(1)">1</button>
              <button class="key-btn" @click="appendNumber(2)">2</button>
              <button class="key-btn" @click="appendNumber(3)">3</button>
              <button class="key-btn" @click="appendNumber(4)">4</button>
              <button class="key-btn" @click="appendNumber(5)">5</button>
              <button class="key-btn" @click="appendNumber(6)">6</button>
              <button class="key-btn" @click="appendNumber(7)">7</button>
              <button class="key-btn" @click="appendNumber(8)">8</button>
              <button class="key-btn" @click="appendNumber(9)">9</button>
              <button class="key-btn" @click="appendDoubleZero">00</button>
              <button class="key-btn" @click="appendNumber(0)">0</button>
              <button class="key-btn delete-btn" @click="deleteLastDigit">⌫</button>
            </div>

            <div class="discount-actions">
              <button class="total-discount-btn" @click="selectAllItems">
                전체 선택
              </button>
              <button class="apply-discount-btn" @click="applyDiscount">
                할인 적용
              </button>
            </div>
          </div>

          <!-- Right: Order Items -->
          <div class="discount-right">
            <div class="discount-items-header">
              <h3>선택 품목</h3>
              <span class="selected-count">
                {{ selectedDiscountItems.length }}개 선택
              </span>
            </div>

            <div class="discount-items-list">
              <div
                v-for="item in ordersStore.currentOrder"
                :key="item.productId"
                class="discount-item"
                :class="{ selected: isItemSelected(item.productId) }"
                @click="toggleDiscountItem(item.productId)"
              >
                <div class="discount-item-check">
                  <span v-if="isItemSelected(item.productId)" class="check-icon">✓</span>
                </div>
                <div class="discount-item-info">
                  <div class="discount-item-name">{{ item.productName }}</div>
                  <div class="discount-item-detail">
                    {{ item.quantity }}개 × {{ formatPrice(item.price) }}
                  </div>
                </div>
                <div class="discount-item-price">
                  {{ formatPrice(item.subtotal) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Phone Search Keypad -->
    <NumberKeypad
      v-if="showPhoneKeypad"
      v-model="memberPhone"
      title="전화번호 조회"
      placeholder="전화번호를 입력하세요"
      :max-length="11"
      @confirm="confirmPhoneSearch"
      @close="showPhoneKeypad = false"
    />

    <!-- Register Phone Keypad -->
    <NumberKeypad
      v-if="showRegisterPhoneKeypad"
      v-model="newMemberPhone"
      title="전화번호 입력"
      placeholder="전화번호를 입력하세요"
      :max-length="11"
      @confirm="confirmRegisterPhone"
      @close="showRegisterPhoneKeypad = false"
    />

    <!-- Name Input Keypad -->
    <TextKeypad
      v-if="showNameKeypad"
      v-model="newMemberName"
      title="이름 입력"
      placeholder="이름을 입력하세요"
      :max-length="20"
      @confirm="confirmNameInput"
      @close="showNameKeypad = false"
    />
  </div>
</template>

<style scoped>
.pos-view {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
  background: var(--bg-gray);
  position: relative;
}

@media (min-width: 1024px) {
  .pos-view {
    flex-direction: row;
  }
}

.products-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
  height: 100%;
}

@media (min-width: 768px) {
  .products-section {
    padding: 16px;
  }
}

@media (min-width: 1280px) {
  .products-section {
    padding: 20px;
  }
}

.section-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.search-bar {
  flex: 1;
  max-width: 600px;
}

.edit-mode-btn {
  padding: 16px 32px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: white;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.edit-mode-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.edit-mode-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.search-input {
  width: 100%;
  padding: 16px 20px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-input:focus {
  border-color: var(--primary-color);
}

.categories {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  flex-shrink: 0;
}

.category-btn {
  padding: 14px 28px;
  border: 1px solid var(--border-color);
  border-radius: 24px;
  background: white;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.category-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.category-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.products-grid-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.products-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
  overflow: hidden;
}

@media (max-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(6, 1fr);
    gap: 12px;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  margin-top: 16px;
  flex-shrink: 0;
}

.page-btn {
  padding: 12px 24px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: #f0f7ff;
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-info {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  min-width: 80px;
  text-align: center;
}

.product-card {
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 100px;
  position: relative;
}

.product-card:hover:not(.empty) {
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 100, 255, 0.15);
}

.product-card.empty {
  background: var(--bg-gray);
  border: 2px dashed var(--border-color);
  cursor: default;
}

.product-card.empty.edit-mode {
  cursor: pointer;
  border-color: var(--primary-color);
}

.product-card.empty.edit-mode:hover {
  background: #f0f7ff;
}

.delete-slot-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: var(--error-color);
  color: white;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 10;
}

.delete-slot-btn:hover {
  background: #D03A47;
  transform: scale(1.1);
}

.product-name {
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 10px;
  color: var(--text-primary);
  word-break: keep-all;
  line-height: 1.3;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 6px;
}

.product-stock {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
}

.add-product-btn {
  font-size: 56px;
  color: var(--primary-color);
  font-weight: 300;
}

.order-section {
  width: 100%;
  max-height: 50vh;
  background: white;
  border-top: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

@media (min-width: 1024px) {
  .order-section {
    width: 420px;
    max-height: 100vh;
    border-top: none;
    border-left: 1px solid var(--border-color);
    position: static;
    box-shadow: none;
  }
}

@media (min-width: 1280px) {
  .order-section {
    width: 480px;
  }
}

.membership-section {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  background: #F0F9FF;
}

@media (min-width: 1024px) {
  .membership-section {
    padding: 20px 28px;
  }
}

.membership-search {
  display: flex;
  gap: 8px;
}

.member-phone-input {
  flex: 1;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s;
  cursor: pointer;
  background: white;
}

.member-phone-input:focus {
  border-color: var(--primary-color);
}

.member-search-btn {
  padding: 12px 20px;
  background: var(--primary-color);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.member-search-btn:hover {
  background: #0052CC;
}

.member-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.member-details {
  display: flex;
  gap: 16px;
  align-items: center;
}

.member-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
}

.member-points {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-color);
}

.member-coupons {
  font-size: 14px;
  font-weight: 600;
  color: var(--warning-color);
}

.member-clear-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 50%;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.member-clear-btn:hover {
  background: var(--error-color);
  color: white;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

@media (min-width: 1024px) {
  .order-header {
    padding: 24px 28px;
  }
}

.order-header h2 {
  font-size: 18px;
  font-weight: 700;
}

@media (min-width: 1024px) {
  .order-header h2 {
    font-size: 22px;
  }
}

.order-actions {
  display: flex;
  gap: 8px;
}

.held-btn,
.hold-btn,
.clear-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.held-btn {
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.held-btn:hover {
  background: #EBF3FF;
}

.hold-btn {
  color: var(--text-secondary);
}

.hold-btn:hover {
  background: var(--bg-gray);
}

.clear-btn {
  color: var(--text-secondary);
}

.clear-btn:hover {
  background: var(--bg-gray);
}

.order-items {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
}

@media (min-width: 1024px) {
  .order-items {
    padding: 20px 24px;
  }
}

.empty-order {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 16px;
}

.order-item {
  padding: 20px;
  background: var(--bg-gray);
  border-radius: 12px;
  margin-bottom: 12px;
}

.item-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
}

.item-name {
  font-size: 17px;
  font-weight: 600;
}

.item-price {
  font-size: 15px;
  color: var(--text-secondary);
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.qty-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.qty-btn:hover {
  background: var(--bg-gray);
}

.qty {
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
}

.remove-btn {
  margin-left: auto;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--error-color);
  border-radius: 8px;
  font-size: 14px;
  color: var(--error-color);
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: var(--error-color);
  color: white;
}

.item-subtotal {
  text-align: right;
  font-size: 18px;
  font-weight: 700;
  color: var(--primary-color);
}

.order-summary {
  padding: 28px;
  border-top: 1px solid var(--border-color);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 16px;
  color: var(--text-secondary);
}

.summary-row.total {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid var(--border-color);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.total-amount {
  color: var(--primary-color);
  font-size: 32px;
}

.discount-btn {
  margin: 0 28px 12px;
  padding: 16px;
  background: var(--warning-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.discount-btn:hover:not(:disabled) {
  background: #FF9900;
}

.discount-btn:disabled {
  background: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}

.payment-btn {
  margin: 0 28px 28px;
  padding: 20px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.payment-btn:hover:not(:disabled) {
  background: #0052CC;
}

.payment-btn:disabled {
  background: var(--border-color);
  color: var(--text-secondary);
  cursor: not-allowed;
}

/* Held Orders Modal */
.held-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.held-modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.held-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.held-modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.held-modal-header .close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.held-modal-header .close-btn:hover {
  background: var(--bg-gray);
}

.held-orders-list {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.held-order-card {
  background: var(--bg-gray);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.held-order-info {
  flex: 1;
}

.held-order-id {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.held-order-time {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.held-order-items {
  font-size: 14px;
  color: var(--text-primary);
}

.held-order-actions {
  display: flex;
  gap: 8px;
}

/* Add Product Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.modal-header .close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-header .close-btn:hover {
  background: var(--bg-gray);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.product-select-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.product-select-card {
  background: var(--bg-gray);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.product-select-card:hover {
  border-color: var(--primary-color);
  background: #f0f7ff;
  transform: translateY(-2px);
}

.product-select-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.product-select-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 4px;
}

.product-select-stock {
  font-size: 13px;
  color: var(--text-secondary);
}

/* Membership Register Modal */
.membership-register-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.membership-register-modal .form-group {
  margin-bottom: 20px;
}

.membership-register-modal .form-group label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.membership-register-modal .form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.membership-register-modal .form-input:focus {
  border-color: var(--primary-color);
}

.membership-register-modal .form-input[readonly] {
  background: var(--bg-gray);
  cursor: pointer;
}

.membership-register-modal .date-input {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 14px 16px;
  line-height: 1.5;
}

.membership-register-modal .date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}

/* Price Setting Modal */
.price-modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.price-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.selected-product-info {
  padding: 20px;
  background: var(--bg-gray);
  border-radius: 12px;
  text-align: center;
}

.product-info-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.product-info-default {
  font-size: 15px;
  color: var(--text-secondary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.required {
  color: var(--error-color);
}

.price-input {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  outline: none;
  transition: border-color 0.2s;
}

.price-input:focus {
  border-color: var(--primary-color);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--border-color);
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: var(--bg-gray);
  color: var(--text-secondary);
}

.cancel-btn:hover {
  background: #E5E8EB;
}

.confirm-btn {
  background: var(--primary-color);
  color: white;
}

.confirm-btn:hover {
  background: #0052CC;
}

/* Discount Modal */
.discount-modal-content {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1000px;
  max-height: 90vh;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.discount-modal-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.discount-left {
  flex: 1;
  padding: 24px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.discount-type-selector {
  display: flex;
  gap: 12px;
}

.type-btn {
  flex: 1;
  padding: 14px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.type-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.discount-input-display {
  position: relative;
}

.discount-display {
  width: 100%;
  padding: 20px 60px 20px 20px;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 32px;
  font-weight: 700;
  text-align: right;
  background: var(--bg-gray);
  color: var(--text-primary);
}

.discount-unit {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 24px;
  font-weight: 600;
  color: var(--text-secondary);
}

.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.key-btn {
  padding: 24px;
  border: 2px solid var(--border-color);
  background: white;
  border-radius: 12px;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.key-btn:hover {
  background: var(--bg-gray);
  border-color: var(--primary-color);
}

.key-btn:active {
  background: #E5E8EB;
}

.delete-btn {
  background: var(--warning-color);
  color: white;
  border-color: var(--warning-color);
}

.delete-btn:hover {
  background: #FF9900;
}

.discount-actions {
  display: flex;
  gap: 12px;
  margin-top: auto;
}

.total-discount-btn,
.apply-discount-btn {
  flex: 1;
  padding: 18px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.total-discount-btn {
  background: var(--bg-gray);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.total-discount-btn:hover {
  background: #E5E8EB;
}

.apply-discount-btn {
  background: var(--primary-color);
  color: white;
}

.apply-discount-btn:hover {
  background: #0052CC;
}

.discount-right {
  width: 380px;
  display: flex;
  flex-direction: column;
  background: var(--bg-gray);
}

.discount-items-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.discount-items-header h3 {
  font-size: 16px;
  font-weight: 700;
}

.selected-count {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
}

.discount-items-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.discount-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.discount-item:hover {
  border-color: var(--primary-color);
}

.discount-item.selected {
  border-color: var(--primary-color);
  background: #f0f7ff;
}

.discount-item-check {
  width: 28px;
  height: 28px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.discount-item.selected .discount-item-check {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.check-icon {
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.discount-item-info {
  flex: 1;
}

.discount-item-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.discount-item-detail {
  font-size: 13px;
  color: var(--text-secondary);
}

.discount-item-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
}

.retrieve-btn,
.delete-held-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retrieve-btn {
  background: var(--primary-color);
  color: white;
}

.retrieve-btn:hover {
  background: #0052CC;
}

.delete-held-btn {
  background: white;
  color: var(--error-color);
  border: 1px solid var(--error-color);
}

.delete-held-btn:hover {
  background: var(--error-color);
  color: white;
}
</style>