<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useOrdersStore } from '@/stores/orders'
import categoryAPI from '@/api/category'

// Composables
import { useProductGrid } from '@/composables/pos/useProductGrid'
import { useOrder } from '@/composables/pos/useOrder'
import { useMembership } from '@/composables/pos/useMembership'

// Components
import PaymentModal from '@/components/pos/modals/PaymentModal.vue'
import NumberKeypad from '@/components/common/NumberKeypad.vue'
import TextKeypad from '@/components/common/TextKeypad.vue'
import ProductGrid from '@/components/pos/ProductGrid.vue'
import OrderSummary from '@/components/pos/OrderSummary.vue'
import MembershipSection from '@/components/pos/MembershipSection.vue'
import HeldOrdersModal from '@/components/pos/modals/HeldOrdersModal.vue'
import MembershipRegisterModal from '@/components/pos/modals/MembershipRegisterModal.vue'
import AddProductModal from '@/components/pos/modals/AddProductModal.vue'

const productsStore = useProductsStore()
const ordersStore = useOrdersStore()

// Composables - 각 도메인별 로직 분리
const productGrid = useProductGrid()
const order = useOrder()
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

// Utility
const formatPrice = (price) => {
  return price.toLocaleString('ko-KR') + '원'
}

// 카테고리 불러오기
const fetchCategories = async () => {
  const result = await categoryAPI.getCategoryList()

  if (result.success && result.data.categories) {
    const categories = [
      { id: 'all', name: '전체' },
      ...result.data.categories.map(cat => ({
        id: cat.category,
        name: cat.category
      }))
    ]
    productsStore.setCategories(categories)
  } else {
    console.error('Failed to fetch categories:', result.message)
  }
}

onMounted(() => {
  fetchCategories()
  productsStore.fetchProducts() // 초기 상품 목록 로드
})
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

    <AddProductModal
      v-if="productGrid.showAddProductModal.value"
      @close="productGrid.closeAddProductModal"
      @select="productGrid.addProductToSlot"
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

</style>
