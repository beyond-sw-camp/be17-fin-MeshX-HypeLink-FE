import api from "@/plugins/axiosinterceptors.js";

const getCustomerByPhone = async (phone) => {
    const url = `/api/customer/phone/${phone}`
    let result = { success: false }

    await api.get(url)
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "고객 조회 실패" }
        })

    return result
}

const getCustomerWithAvailableCoupons = async (phone) => {
    const url = `/api/mono/customer/phone/${phone}/available-coupons`
    let result = { success: false }

    await api.get(url)
        .then((response) => {
            result = { success: true, data: response.data.data }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "고객 조회 실패" }
        })

    return result
}

const signupCustomer = async (customerData) => {
    const url = "/api/customer/signup"
    let result = { success: false }

    await api.post(url, customerData)
        .then((response) => {
            result = { success: true, message: response.data.data || "회원가입이 완료되었습니다." }
        })
        .catch((error) => {
            result = { success: false, message: error.response?.data?.message || "회원가입 실패" }
        })

    return result
}

export default {
    getCustomerByPhone,
    getCustomerWithAvailableCoupons,
    signupCustomer
}
