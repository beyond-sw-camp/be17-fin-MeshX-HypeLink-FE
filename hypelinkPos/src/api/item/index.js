import api from "@/plugins/axiosinterceptors.js";

// 특정 매장의 전체 상품 조회 (페이징)
const getItemList = async (page = 0, size = 50) => {
    const url = "/api/store/item/list"
    let result = { success: false }

    await api.get(url, { params: { page, size } })
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "상품 목록 조회 실패" }
        })

    return result
}

// 상품 검색 (한글명, 영문명, 바코드)
const searchItems = async (keyword, page = 0, size = 50) => {
    const url = "/api/store/item/search"
    let result = { success: false }

    await api.get(url, { params: { keyword, page, size } })
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "상품 검색 실패" }
        })

    return result
}

// 카테고리별 상품 조회
const getItemsByCategory = async (category, page = 0, size = 50) => {
    const url = "/api/store/item/category"
    let result = { success: false }

    await api.get(url, { params: { category, page, size } })
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "카테고리별 상품 조회 실패" }
        })

    return result
}

// 재고 부족 상품 조회
const getLowStockItems = async (minStock = 10, page = 0, size = 50) => {
    const url = "/api/store/item/low-stock"
    let result = { success: false }

    await api.get(url, { params: { minStock, page, size } })
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "재고 부족 상품 조회 실패" }
        })

    return result
}

// 바코드로 상품 조회
const getItemByBarcode = async (code) => {
    const url = "/api/store/item/barcode"
    let result = { success: false }

    await api.get(url, { params: { code } })
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "바코드 조회 실패" }
        })

    return result
}

export default {
    getItemList,
    searchItems,
    getItemsByCategory,
    getLowStockItems,
    getItemByBarcode
}
