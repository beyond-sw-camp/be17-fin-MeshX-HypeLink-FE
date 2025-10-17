import api from "@/plugins/axiosinterceptor";

export const saveNewItem = async (itemForm) => {
    const requestUrl = `/api/item/create`
    let data = {}
    await api.post(requestUrl, itemForm)
        .then((response) => {
            data = response.data
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
            data = response.data
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export default {
    saveNewItem, getItems
}