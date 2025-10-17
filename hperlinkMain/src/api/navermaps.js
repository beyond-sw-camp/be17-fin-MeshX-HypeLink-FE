
import api from '@/plugins/axiosinterceptor';

/**
 * Naver Maps Geocoding API를 호출하여 주소를 좌표로 변환합니다.
 * @param {string} address - 변환할 주소
 * @returns {Promise<{success: boolean, coords: {lat: number, lon: number}|null, message: string}>}
 */
export const geocodeAddress = async (address) => {
  if (!address) {
    return { success: false, coords: null, message: '주소를 입력해주세요.' };
  }

  try {
    // 참고: 실제 API 호출 시에는 API 키가 필요하며,
    // 이는 프로젝트의 api/index.js 또는 전역 설정에서 처리된다고 가정합니다.
    // Naver Geocoding API는 GET 요청을 사용합니다.
    const response = await api.get('/api/maps/geocode', {
      params: {
        query: address,
      },
    });

    if (response.data && response.data.status === 'OK' && response.data.addresses.length > 0) {
      const location = response.data.addresses[0];
      return {
        success: true,
        coords: {
          lat: parseFloat(location.y),
          lon: parseFloat(location.x),
        },
        message: '주소 변환에 성공했습니다.',
      };
    } else {
      return {
        success: false,
        coords: null,
        message: response.data.errorMessage || '주소를 찾을 수 없습니다.',
      };
    }
  } catch (error) {
    console.error('Geocoding API error:', error);
    const message = error.response?.data?.message || '주소 변환 중 오류가 발생했습니다.';
    return { success: false, coords: null, message };
  }
};
