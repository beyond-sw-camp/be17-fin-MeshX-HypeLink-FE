import api from "@/plugins/axiosinterceptors.js";

// 매장별 주문 내역 조회
const getOrdersByStore = async (storeId) => {
    const url = "/api/customer/receipts"
    let result = { success: false }

    await api.get(url, { params: { storeId } })
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "주문 내역 조회 실패" }
        })

    return result
}

export default {
    getOrdersByStore
}
