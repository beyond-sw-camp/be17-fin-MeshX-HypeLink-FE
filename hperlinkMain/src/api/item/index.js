import api from "@/plugins/axiosinterceptor";

export const saveNewItem = async (itemForm) => {
    const requestUrl = `/api/item/create`
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

export const getItems = async (page = 0, size = 10, sort = 'id,desc') => {
    const requestUrl = `/api/item/list`
    let data = {}
    await api.get(requestUrl, {
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

export const updateContent = async (updateForm) => {
    const requestUrl = `/api/item/content`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateStock = async (updateForm) => {
    const requestUrl = `/api/item/stock`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateEnName = async (updateForm) => {
    const requestUrl = `/api/item/en_name`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateKoName = async (updateForm) => {
    const requestUrl = `/api/item/ko_name`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateAmount = async (updateForm) => {
    const requestUrl = `/api/item/amount`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateUnitPrice = async (updateForm) => {
    const requestUrl = `/api/item/unit_price`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateCompany = async (updateForm) => {
    const requestUrl = `/api/item/company`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateCategory = async (updateForm) => {
    const requestUrl = `/api/item/category`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export const updateImages = async (updateForm) => {
    const requestUrl = `/api/item/images`
    let data = {}
    await api.patch(requestUrl, updateForm)
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export default {
    saveNewItem, getItems, updateContent, updateStock, updateEnName, updateKoName, updateAmount,
    updateCompany, updateCategory, updateImages, updateUnitPrice
}