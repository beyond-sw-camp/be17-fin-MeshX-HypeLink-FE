import api from "@/plugins/axiosinterceptor";

/**
 * 매출 현황 조회
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @param {object} filters - { startDate, endDate, storeIds, categories }
 */
export const getSalesOverview = async (period = 'weekly', filters = {}) => {
    const requestUrl = `/api/analytics/sales/overview`
    let data = {}
    const params = { period }
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.storeIds?.length) params.storeIds = filters.storeIds
    if (filters.categories?.length) params.categories = filters.categories

    await api.get(requestUrl, { params })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch sales overview:', error)
            data = { data: null }
        })
    return data
}

/**
 * 주문 현황 조회
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getOrderOverview = async (period = 'weekly') => {
    const requestUrl = `/api/analytics/orders/overview`
    let data = {}
    await api.get(requestUrl, {
        params: { period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch order overview:', error)
            data = { data: null }
        })
    return data
}

/**
 * 매장별 매출 TOP N
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @param {number} limit - 조회할 개수
 * @param {object} filters - { startDate, endDate, categories }
 */
export const getTopStores = async (period = 'weekly', limit = 5, filters = {}) => {
    const requestUrl = `/api/analytics/stores/top`
    let data = {}
    const params = { period, limit }
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.categories?.length) params.categories = filters.categories

    await api.get(requestUrl, { params })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch top stores:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 상품별 매출 TOP N
 * @param {string} period - 'daily', 'weekly', 'monthly'
 * @param {number} limit - 조회할 개수
 * @param {object} filters - { startDate, endDate, storeIds, categories }
 */
export const getTopProducts = async (period = 'weekly', limit = 20, filters = {}) => {
    const requestUrl = `/api/analytics/products/top`
    let data = {}
    const params = { period, limit }
    if (filters.startDate) params.startDate = filters.startDate
    if (filters.endDate) params.endDate = filters.endDate
    if (filters.storeIds?.length) params.storeIds = filters.storeIds
    if (filters.categories?.length) params.categories = filters.categories

    await api.get(requestUrl, { params })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch top products:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 카테고리별 성과
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getCategoryPerformance = async (period = 'weekly') => {
    const requestUrl = `/api/analytics/categories/performance`
    let data = {}
    await api.get(requestUrl, {
        params: { period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch category performance:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 재고 부족 품목 조회
 * @param {number} threshold - 재고 기준값
 */
export const getLowStockItems = async (threshold = 20) => {
    const requestUrl = `/api/analytics/inventory/low-stock`
    let data = {}
    await api.get(requestUrl, {
        params: { threshold },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch low stock items:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 매출 추이 조회
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getSalesTrend = async (period = 'weekly') => {
    const requestUrl = `/api/analytics/sales/trend`
    let data = {}
    await api.get(requestUrl, {
        params: { period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch sales trend:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 주문 추이 조회
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getOrderTrend = async (period = 'weekly') => {
    const requestUrl = `/api/analytics/orders/trend`
    let data = {}
    await api.get(requestUrl, {
        params: { period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch order trend:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 시간대별 매출 히트맵
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getSalesHeatmap = async (period = 'weekly') => {
    const requestUrl = `/api/analytics/sales/heatmap`
    let data = {}
    await api.get(requestUrl, {
        params: { period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch sales heatmap:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 매장 전체 리스트 (페이지네이션)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getAllStores = async (page = 0, size = 20, period = 'weekly') => {
    const requestUrl = `/api/analytics/stores/all`
    let data = {}
    await api.get(requestUrl, {
        params: { page, size, period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch all stores:', error)
            data = { data: { content: [], totalElements: 0 } }
        })
    return data
}

/**
 * 상품 전체 리스트 (페이지네이션)
 * @param {number} page - 페이지 번호
 * @param {number} size - 페이지 크기
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getAllProducts = async (page = 0, size = 50, period = 'weekly') => {
    const requestUrl = `/api/analytics/products/all`
    let data = {}
    await api.get(requestUrl, {
        params: { page, size, period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch all products:', error)
            data = { data: { content: [], totalElements: 0 } }
        })
    return data
}

/**
 * 고객 RFM 분석
 * @param {number} limit - 조회할 고객 수
 */
export const getCustomerRFM = async (limit = 100) => {
    const requestUrl = `/api/analytics/customers/rfm`
    let data = {}
    await api.get(requestUrl, {
        params: { limit },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch customer RFM:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 상품 ABC 분석
 * @param {string} period - 'daily', 'weekly', 'monthly'
 */
export const getProductABC = async (period = 'monthly') => {
    const requestUrl = `/api/analytics/products/abc`
    let data = {}
    await api.get(requestUrl, {
        params: { period },
    })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch product ABC:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 일별 매출 데이터 조회 (Sales Management 페이지용)
 * @param {string} startDate - 시작일 (yyyy-MM-dd)
 * @param {string} endDate - 종료일 (yyyy-MM-dd)
 * @param {number} storeId - 매장 ID (optional)
 */
export const getDailySales = async (startDate, endDate, storeId) => {
    const requestUrl = `/api/analytics/sales/daily`
    let data = {}
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (storeId) params.storeId = storeId

    await api.get(requestUrl, { params })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch daily sales:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 최근 7일간 매출 차트 데이터 (Sales Management 페이지용)
 * @param {number} storeId - 매장 ID (optional)
 */
export const getSalesChartData = async (storeId) => {
    const requestUrl = `/api/analytics/sales/chart`
    let data = {}
    const params = {}
    if (storeId) params.storeId = storeId

    await api.get(requestUrl, { params })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch sales chart data:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 고객 분석 데이터 조회 (Customer Analytics 페이지용)
 */
export const getCustomerAnalytics = async () => {
    const requestUrl = `/api/analytics/customers/analytics`
    let data = {}
    await api.get(requestUrl)
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch customer analytics:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 연령대별 고객 분포
 */
export const getAgeDistribution = async () => {
    const requestUrl = `/api/analytics/customers/age-distribution`
    let data = {}
    await api.get(requestUrl)
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch age distribution:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 카테고리별 고객 매출 (Customer Analytics 페이지용)
 */
export const getCategoryCustomerSales = async () => {
    const requestUrl = `/api/analytics/customers/category-sales`
    let data = {}
    await api.get(requestUrl)
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch category customer sales:', error)
            data = { data: [] }
        })
    return data
}

/**
 * 일별 그룹화된 매출 데이터 조회 (Sales Management 페이지용)
 * @param {string} startDate - 시작일 (yyyy-MM-dd)
 * @param {string} endDate - 종료일 (yyyy-MM-dd)
 * @param {number} storeId - 매장 ID (optional)
 */
export const getDailySalesGrouped = async (startDate, endDate, storeId) => {
    const requestUrl = `/api/analytics/sales/daily-grouped`
    let data = {}
    const params = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    if (storeId) params.storeId = storeId

    await api.get(requestUrl, { params })
        .then((response) => {
            data = response.data
        })
        .catch((error) => {
            console.error('Failed to fetch daily grouped sales:', error)
            data = { data: [] }
        })
    return data
}

export default {
    getSalesOverview,
    getOrderOverview,
    getTopStores,
    getTopProducts,
    getCategoryPerformance,
    getLowStockItems,
    getSalesTrend,
    getOrderTrend,
    getSalesHeatmap,
    getAllStores,
    getAllProducts,
    getCustomerRFM,
    getProductABC,
    getDailySales,
    getSalesChartData,
    getCustomerAnalytics,
    getAgeDistribution,
    getCategoryCustomerSales,
    getDailySalesGrouped
}
