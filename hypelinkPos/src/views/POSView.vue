<script setup>
import { ref, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'

// Composables
import { useProductGrid } from '@/composables/pos/useProductGrid'
import { useOrder } from '@/composables/pos/useOrder'
import { useDiscount } from '@/composables/pos/useDiscount'
import { useMembership } from '@/composables/pos/useMembership'
import { useBarcodeScanner } from '@/composables/pos/useBarcodeScanner'

// Components
import PaymentModal from '@/components/pos/modals/PaymentModal.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'
import TextKeypad from '@/components/common/TextKeypad.vue'
import ProductGrid from '@/components/pos/ProductGrid.vue'
import OrderSummary from '@/components/pos/OrderSummary.vue'
import MembershipSection from '@/components/pos/MembershipSection.vue'
import DiscountModal from '@/components/pos/modals/DiscountModal.vue'
import HeldOrdersModal from '@/components/pos/modals/HeldOrdersModal.vue'
import MembershipRegisterModal from '@/components/pos/modals/MembershipRegisterModal.vue'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()

// Composables - 각 도메인별 로직 분리
const productGrid = useProductGrid()
const order = useOrder()
const discount = useDiscount()
const membership = useMembership()

// Payment State
const showPaymentModal = ref(false)

// Computed
const orderTotal = computed(() => ordersStore.getOrderTotal())
const availableProducts = computed(() => productsStore.products)

// Payment Handlers
const openPayment = () => {
  if (ordersStore.currentOrder.length === 0) return
  showPaymentModal.value = true
}

const handlePaymentComplete = () => {
  showPaymentModal.value = false
}

// Barcode Scanner - addProduct를 인자로 전달
useBarcodeScanner(order.addProduct)

// Utility
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}
</script>

<template>
  <div class="pos-view">
    <!-- Product Grid Section -->
    <ProductGrid
      v-model:selected-category="productGrid.selectedCategory.value"
      v-model:search-query="productGrid.searchQuery.value"
      v-model:current-page="productGrid.currentPage.value"
      :is-edit-mode="productGrid.isEditMode.value"
      @toggle-edit-mode="productGrid.toggleEditMode"
      @add-product="order.addProduct"
      @open-add-product="productGrid.openAddProduct"
      @remove-product-from-slot="productGrid.removeProductFromSlot"
    />

    <!-- Order Section -->
    <div class="order-section-wrapper">
      <MembershipSection
        :member-phone="membership.memberPhone.value"
        :current-member="membership.currentMember.value"
        @open-phone-keypad="membership.openPhoneKeypad"
        @clear-member="membership.clearMember"
      />

      <OrderSummary
        :order-total="orderTotal"
        @update-item-quantity="order.updateItemQuantity"
        @remove-item="order.removeItem"
        @hold-current-order="order.holdCurrentOrder"
        @show-held-orders="order.showHeldOrders.value = true"
        @cancel-order="order.cancelOrder"
        @open-discount="discount.openDiscountModal"
        @open-payment="openPayment"
      />
    </div>

    <!-- Modals -->
    <PaymentModal
      v-if="showPaymentModal"
      :total="orderTotal"
      :member="membership.currentMember.value"
      @close="showPaymentModal = false"
      @complete="handlePaymentComplete"
    />

    <HeldOrdersModal
      v-if="order.showHeldOrders.value"
      @close="order.showHeldOrders.value = false"
      @retrieve-order="order.retrieveHeldOrder"
      @remove-held="order.removeHeld"
    />

    <div v-if="productGrid.showAddProductModal.value" class="modal-overlay" @click="productGrid.closeAddProductModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>품목 추가</h2>
          <button class="close-btn" @click="productGrid.closeAddProductModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="product-select-grid">
            <div
              v-for="product in availableProducts"
              :key="product.id"
              class="product-select-card"
              @click="productGrid.addProductToSlot(product)"
            >
              <div class="product-select-name">{{ product.name }}</div>
              <div class="product-select-price">{{ formatPrice(product.price) }}</div>
              <div class="product-select-stock">재고: {{ product.stock }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <DiscountModal
      v-if="discount.showDiscountModal.value"
      v-model:discount-type="discount.discountType.value"
      v-model:discount-value="discount.discountValue.value"
      v-model:selected-discount-items="discount.selectedDiscountItems.value"
      @close="discount.closeDiscountModal"
      @select-all-items="discount.selectAllItems"
      @apply-discount="discount.applyDiscount"
      @open-discount-keypad="discount.openDiscountKeypad"
    />

    <MembershipRegisterModal
      v-if="membership.showMembershipRegisterModal.value"
      v-model:new-member-name="membership.newMemberName.value"
      v-model:new-member-phone="membership.newMemberPhone.value"
      v-model:new-member-birthdate="membership.newMemberBirthdate.value"
      @close="membership.showMembershipRegisterModal.value = false"
      @register="membership.registerMember"
      @open-name-keypad="membership.openNameKeypad"
      @open-register-phone-keypad="membership.openRegisterPhoneKeypad"
    />

    <!-- Keypads -->
    <NumberKeypad
      v-if="membership.showPhoneKeypad.value"
      v-model="membership.memberPhone.value"
      title="전화번호 조회"
      placeholder="전화번호를 입력하세요"
      :max-length="11"
      @confirm="membership.confirmPhoneSearch"
      @close="membership.showPhoneKeypad.value = false"
    />

    <NumberKeypad
      v-if="membership.showRegisterPhoneKeypad.value"
      v-model="membership.newMemberPhone.value"
      title="전화번호 입력"
      placeholder="전화번호를 입력하세요"
      :max-length="11"
      @confirm="membership.confirmRegisterPhone"
      @close="membership.showRegisterPhoneKeypad.value = false"
    />

    <TextKeypad
      v-if="membership.showNameKeypad.value"
      v-model="membership.newMemberName.value"
      title="이름 입력"
      placeholder="이름을 입력하세요"
      :max-length="20"
      @confirm="membership.confirmNameInput"
      @close="membership.showNameKeypad.value = false"
    />

    <NumberKeypad
      v-if="discount.showDiscountKeypad.value"
      v-model="discount.discountValue.value"
      :title="discount.discountType.value === 'amount' ? '할인 금액 입력' : '할인 비율 입력'"
      :placeholder="discount.discountType.value === 'amount' ? '금액을 입력하세요' : '비율을 입력하세요'"
      :max-length="10"
      :show-double-zero="true"
      @confirm="discount.confirmDiscountValue"
      @close="discount.showDiscountKeypad.value = false"
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

.order-section-wrapper {
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
  .order-section-wrapper {
    width: 420px;
    max-height: 100vh;
    border-top: none;
    border-left: 1px solid var(--border-color);
    position: static;
    box-shadow: none;
  }
}

@media (min-width: 1280px) {
  .order-section-wrapper {
    width: 480px;
  }
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
</style>
