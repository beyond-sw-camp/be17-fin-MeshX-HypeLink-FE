import api from "@/plugins/axiosinterceptors.js";


const validatePayment = async ( name, paymentId, orderData) => {
    const url = "/api/payments/validate"
    let data = {}

    const requestData = {
        name: name,
        paymentId: paymentId,
        orderData: orderData
    }

    await api.post(url, requestData)
        .then((response) => {
            data = response.data;
        })
        .catch((error) => {
            data = error.response?.data || { success: false, message: "결제 검증 실패" }
        })

    return data
}

const getPaymentByOrderNumber = async (orderNumber) => {
    const url = `/api/payments/order/${orderNumber}`
    let data = {}

    await api.get(url)
        .then((response) => {
            data = response.data;
        })
        .catch((error) => {
            data = error.response?.data || { success: false, message: "결제 정보 조회 실패" }
        })

    return data
}

const getPaymentById = async (paymentId) => {
    const url = `/api/payments/${paymentId}`
    let data = {}

    await api.get(url)
        .then((response) => {
            data = response.data;
        })
        .catch((error) => {
            data = error.response?.data || { success: false, message: "결제 정보 조회 실패" }
        })

    return data
}

export default {
    validatePayment,
    getPaymentByOrderNumber,
    getPaymentById
}




