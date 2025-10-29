import {getStoreWithAddress} from '@/api/users';

let map = null;
let driverMarkers = {}; // 기사 마커
let storeMarkers = {};  // 매장 마커

export function useShipmentMap(filteredAndSortedShipments) {

    /** 지도 초기화 */
    const initMap = async () => {
        if (!window.naver?.maps) {
            console.error('Naver Maps SDK가 로드되지 않았습니다.');
            return;
        }

        // 지도 생성
        map = new naver.maps.Map('map-container', {
            center: new naver.maps.LatLng(36.5, 127.5),
            zoom: 7,
            mapTypeControl: true
        });

        clearAllMarkers();

        // 매장 핀 세팅
        await loadStoreMarkers();

        // 기사 핀 세팅
        updateDriverMarkers();

        console.log('지도 초기화 완료');
    };

    /** 모든 마커 제거 */
    const clearAllMarkers = () => {
        Object.values(driverMarkers).forEach(m => m.setMap(null));
        Object.values(storeMarkers).forEach(m => m.setMap(null));
        driverMarkers = {};
        storeMarkers = {};
    };

    /** 매장 마커 로딩 */
    const loadStoreMarkers = async () => {
        try {
            const res = await getStoreWithAddress();
            const stores = res?.data?.stores ?? [];

            if (!Array.isArray(stores)) {
                console.warn('매장 데이터 형식이 올바르지 않습니다:', stores);
                return;
            }

            // 기존 마커 제거
            Object.values(storeMarkers).forEach(m => m.setMap(null));
            storeMarkers = {};

            stores.forEach(store => {
                // 서버 응답이 lat/lon 이므로 일관화
                const { id, storeName, lat, lon, address } = store;
                if (!lat || !lon) return;

                const position = new naver.maps.LatLng(lat, lon);

                // 매장 마커 (초록색)
                const marker = new naver.maps.Marker({
                    position,
                    map,
                    icon: {
                        content: `
                            <div style="
                                background:#28a745;
                                color:white;
                                padding:4px 6px;
                                border-radius:4px;
                                font-size:12px;
                                font-weight:500;
                                box-shadow:0 1px 4px rgba(0,0,0,0.2);
                                white-space:nowrap;
                            ">
                                🏪 ${storeName}
                            </div>`
                    }
                });

                // 정보창
                const info = new naver.maps.InfoWindow({
                    content: `
                        <div style="padding:6px;font-size:13px;line-height:1.4;">
                            <b>${storeName}</b><br>
                            ID: ${id}<br>
                            주소: ${address ?? '정보 없음'}
                        </div>`
                });

                naver.maps.Event.addListener(marker, 'click', () => {
                    info.open(map, marker);
                });

                storeMarkers[id] = marker;
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
            const { driverId, latitude, longitude, name, status } = shipment;

            if (!latitude || !longitude || status === '완료') return;

            const pos = new naver.maps.LatLng(latitude, longitude);

            // 기존 마커 있으면 애니메이션으로 이동
            if (driverMarkers[driverId]) {
                animateMarker(driverMarkers[driverId], pos);
            } else {
                // 새 마커 생성 (파란색)
                const marker = new naver.maps.Marker({
                    position: pos,
                    map,
                    icon: {
                        content: `
                            <div style="
                                background:#0066ff;
                                color:white;
                                padding:4px 6px;
                                border-radius:4px;
                                font-size:12px;
                                font-weight:500;
                                box-shadow:0 1px 4px rgba(0,0,0,0.2);
                                white-space:nowrap;
                            ">
                                🚚 ${name}
                            </div>`
                    }
                });

                const info = new naver.maps.InfoWindow({
                    content: `
                        <div style="padding:6px;font-size:13px;line-height:1.4;">
                            <b>${driverId}</b> (${name})<br>
                            상태: ${status}
                        </div>`
                });

                naver.maps.Event.addListener(marker, 'click', () => {
                    info.open(map, marker);
                });

                driverMarkers[driverId] = marker;
            }

            newMarkers[driverId] = driverMarkers[driverId];
        });

        // 사라진 기사 마커 제거
        Object.keys(driverMarkers).forEach(id => {
            if (!newMarkers[id]) {
                driverMarkers[id].setMap(null);
                delete driverMarkers[id];
            }
        });
    };

    /** 기사 마커 애니메이션 (부드러운 이동) */
    const animateMarker = (marker, targetPos) => {
        const startPos = marker.getPosition();
        const startTime = performance.now();
        const duration = 3000;

        const step = now => {
            const progress = Math.min((now - startTime) / duration, 1);
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
