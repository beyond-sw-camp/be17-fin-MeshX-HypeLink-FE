import api from "@/plugins/axiosinterceptor";

export const saveNewPurchaseOrder = async (itemForm) => {
    const requestUrl = `/api/order/head/create`
    let data = {}
    await api.post(requestUrl, itemForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const getHeadPurchaseOrder = async (page = 0, size = 10, sort = 'id,desc') => {
    const requestUrl = `/api/order/read/page/all`
    let data = {}
    await api.get(requestUrl,{
        params: { page, size, sort },
    })
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const getPurchaseOrder = async (page = 0, size = 10, sort = 'id,desc') => {
    const requestUrl = `/api/order/page/all`
    let data = {}
    await api.get(requestUrl,{
        params: { page, size, sort },
    })
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updatePurchaseOrder = async (updateFrom) => {
    const requestUrl = `/api/order/update`
    let data = {}
    await api.patch(requestUrl, updateFrom)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export default {
    saveNewPurchaseOrder, getHeadPurchaseOrder, getPurchaseOrder, updatePurchaseOrder
}