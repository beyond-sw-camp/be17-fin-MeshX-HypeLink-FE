import api from "@/plugins/axiosinterceptor";

export const saveHeadPurchaseOrder = async (itemForm) => {
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

export const savePurchaseOrder = async (itemForm) => {
    const requestUrl = `/api/order/create`
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

export const getHeadPurchaseOrder = async (page = 0, size = 10, sort = 'id,desc',
                                           keyWord='', category) => {
    const requestUrl = `/api/order/read/page/all`
    let data = {}
    await api.get(requestUrl,{
        params: { page, size, sort, keyWord, category },
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

export const getPurchaseOrderDetails = async () => {
    const requestUrl = `/api/order/read/order/detail`
    let data = {}
    await api.get(requestUrl)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const getPurchaseOrderStates = async () => {
    const requestUrl = `/api/order/read/order/state`
    let data = {}
    await api.get(requestUrl)
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
    saveHeadPurchaseOrder, getHeadPurchaseOrder, getPurchaseOrder, updatePurchaseOrder, getPurchaseOrderDetails,
    getPurchaseOrderStates, savePurchaseOrder
}