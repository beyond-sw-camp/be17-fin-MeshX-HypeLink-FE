import api from "@/plugins/axiosinterceptors.js";

// 매장별 주문 내역 조회
const getOrdersByStore = async () => {
    const url = "/api/customer/receipts"
    let result = { success: false }

    // storeId는 백엔드에서 JWT 토큰의 이메일로 자동 조회
    await api.get(url)
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
