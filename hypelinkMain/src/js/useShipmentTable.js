import { ref, computed } from 'vue';
import { useShipmentStore } from '@/stores/shipments';

export function useShipmentTable() {
    const shipmentStore = useShipmentStore();

    // --- 테이블 상태 관리 ---
    const searchTerm = ref('');
    const filterStatus = ref('all'); // 'all', '배송중', '지연', '완료'
    const sortKey = ref('driverId'); // 기본 정렬은 기사 ID
    const sortOrder = ref('asc');
    const currentPage = ref(1);
    const itemsPerPage = ref(5);

    // --- 필터 및 정렬 ---
    const filteredAndSortedShipments = computed(() => {
        let shipments = [...shipmentStore.allShipments];

        // 검색어 필터
        if (searchTerm.value) {
            const term = searchTerm.value.toLowerCase();
            shipments = shipments.filter(s =>
                s.driverId.toLowerCase().includes(term) ||
                s.name.toLowerCase().includes(term) ||
                s.item.toLowerCase().includes(term) ||
                s.from.toLowerCase().includes(term) ||
                s.to.toLowerCase().includes(term)
            );
        }

        // 상태 필터
        if (filterStatus.value !== 'all') {
            shipments = shipments.filter(s => s.status === filterStatus.value);
        }

        // 정렬
        if (sortKey.value) {
            shipments.sort((a, b) => {
                const valA = a[sortKey.value];
                const valB = b[sortKey.value];

                // 숫자 정렬 (예: qty)
                if (typeof valA === 'number' && typeof valB === 'number') {
                    return sortOrder.value === 'asc' ? valA - valB : valB - valA;
                }

                // 문자열 정렬
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();

                if (strA < strB) return sortOrder.value === 'asc' ? -1 : 1;
                if (strA > strB) return sortOrder.value === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return shipments;
    });

    // --- 페이지네이션 ---
    const totalPages = computed(() =>
        Math.ceil(filteredAndSortedShipments.value.length / itemsPerPage.value)
    );

    const paginatedShipments = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filteredAndSortedShipments.value.slice(start, end);
    });

    // --- 이벤트 핸들러 ---
    const updateSort = key => {
        if (sortKey.value === key) {
            sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
            sortKey.value = key;
            sortOrder.value = 'asc';
        }
        currentPage.value = 1;
    };

    const updatePage = page => {
        if (page > 0 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    // --- 상태 뱃지 색상 ---
    const statusClass = status => {
        switch (status) {
            case '배송중':
                return 'bg-primary';
            case '지연':
                return 'bg-danger';
            case '완료':
                return 'bg-success';
            default:
                return 'bg-secondary';
        }
    };

    return {
        searchTerm,
        filterStatus,
        sortKey,
        sortOrder,
        currentPage,
        itemsPerPage,
        filteredAndSortedShipments,
        paginatedShipments,
        totalPages,
        updateSort,
        updatePage,
        statusClass
    };
}
