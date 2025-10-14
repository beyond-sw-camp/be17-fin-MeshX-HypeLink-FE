import { getAllStoreList } from '@/api/store';

let map = null;
let driverMarkers = {}; // 기사 마커
let storeMarkers = {};  // 매장 마커

export function useShipmentMap(filteredAndSortedShipments) {

    /** 지도 초기화 */
    const initMap = async () => {
        map = new naver.maps.Map('map-container', {
            center: new naver.maps.LatLng(36.5, 127.5),
            zoom: 7,
            mapTypeControl: true
        });

        // ✅ 기존 마커 전부 제거
        Object.values(driverMarkers).forEach(m => m.setMap(null));
        Object.values(storeMarkers).forEach(m => m.setMap(null));
        driverMarkers = {};
        storeMarkers = {};

        // 매장 마커 먼저 로딩
        await loadStoreMarkers();
        // 기사 마커 초기화
        updateDriverMarkers();
    };

    /** 매장 마커 로딩 */
    const loadStoreMarkers = async () => {
        try {
            const stores = await getAllStoreList();
            if (!Array.isArray(stores)) {
                console.warn('매장 데이터 형식이 올바르지 않습니다:', stores);
                return;
            }

            // 기존 매장 마커 제거
            Object.values(storeMarkers).forEach(marker => marker.setMap(null));
            storeMarkers = {};

            stores.forEach(store => {
                if (store.latitude && store.longitude) {
                    const pos = new naver.maps.LatLng(store.latitude, store.longitude);

                    const marker = new naver.maps.Marker({
                        position: pos,
                        map: map,
                        icon: {
                            content: `
                                <div style="
                                    padding:4px 6px;
                                    background:#28a745;
                                    color:#fff;
                                    border-radius:4px;
                                    font-size:12px;
                                ">
                                    ${store.name}
                                </div>`
                        }
                    });

                    const info = new naver.maps.InfoWindow({
                        content: `
                            <div style="padding:5px;font-size:13px;">
                                <b>${store.name}</b><br>
                                코드: ${store.storeCode}<br>
                                주소: ${store.address ?? '정보 없음'}
                            </div>`
                    });

                    naver.maps.Event.addListener(marker, 'click', () => {
                        info.open(map, marker);
                    });

                    storeMarkers[store.storeCode] = marker;
                }
            });

            console.log(`매장 ${stores.length}개 마커 표시 완료`);
        } catch (err) {
            console.error('매장 목록 로딩 실패:', err);
        }
    };

    /** 기사 마커 업데이트 */
    const updateDriverMarkers = () => {
        const newMarkers = {};

        filteredAndSortedShipments.value.forEach(shipment => {
            if (shipment.status !== '완료' && shipment.latitude && shipment.longitude) {
                const driverId = shipment.driverId;
                const targetPos = new naver.maps.LatLng(shipment.latitude, shipment.longitude);

                if (driverMarkers[driverId]) {
                    animateMarker(driverMarkers[driverId], targetPos);
                } else {
                    const marker = new naver.maps.Marker({
                        position: targetPos,
                        map: map,
                        icon: {
                            content: `
                                <div style="
                                    padding:4px 6px;
                                    background:#0066ff;
                                    color:#fff;
                                    border-radius:4px;
                                    font-size:12px;
                                ">
                                    ${shipment.name}
                                </div>`
                        }
                    });

                    const info = new naver.maps.InfoWindow({
                        content: `
                            <div style="padding:5px;font-size:13px;">
                                <b>${shipment.driverId}</b><br>
                                ${shipment.name} 기사<br>
                                상태: ${shipment.status}
                            </div>`
                    });

                    naver.maps.Event.addListener(marker, 'click', () => {
                        info.open(map, marker);
                    });

                    driverMarkers[driverId] = marker;
                }

                newMarkers[driverId] = driverMarkers[driverId];
            }
        });

        // 불필요한 마커 제거
        Object.keys(driverMarkers).forEach(id => {
            if (!newMarkers[id]) {
                driverMarkers[id].setMap(null);
                delete driverMarkers[id];
            }
        });
    };

    /** 기사 마커 애니메이션 */
    const animateMarker = (marker, targetPos) => {
        const startPos = marker.getPosition();
        const startTime = performance.now();
        const duration = 4000;

        const step = now => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const lat = startPos.lat() + (targetPos.lat() - startPos.lat()) * progress;
            const lng = startPos.lng() + (targetPos.lng() - startPos.lng()) * progress;
            marker.setPosition(new naver.maps.LatLng(lat, lng));
            if (progress < 1) requestAnimationFrame(step);
        };

        requestAnimationFrame(step);
    };

    return {
        initMap,
        updateMapMarkers: updateDriverMarkers,
        loadStoreMarkers
    };
}
