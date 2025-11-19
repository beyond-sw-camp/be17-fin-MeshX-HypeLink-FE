import api from "@/plugins/axiosinterceptor";

export const getItems = async (page = 0, size = 10, sort = 'id,desc',
                               storeId, keyWord = '', category = 'all') => {
    const requestUrl = `/api/store/item/purchase/list`
    let data = {}
    await api.get(requestUrl, {
        params: { page, size, sort, storeId, keyWord, category },
    })
        .then((response) => {
            data = response
        })
        .catch((error) => {
            data = error.data
        })
    return data
}

export default {
    getItems
}