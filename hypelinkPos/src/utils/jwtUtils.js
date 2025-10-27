/**
 * JWT 토큰을 디코딩하여 payload를 반환합니다.
 * @param {string} token - JWT 토큰
 * @returns {object} - 디코딩된 payload
 */
export function decodeJWT(token) {
  try {
    // JWT 구조: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    // payload 부분 (index 1)을 Base64 디코딩
    const payload = parts[1];
    // Base64 URL-safe 디코딩을 위해 '-'와 '_'를 '+', '/'로 변환
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Base64 디코딩 후 JSON 파싱
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT decoding failed:', error);
    return null;
  }
}

/**
 * JWT 토큰에서 이메일을 추출합니다.
 * @param {string} token - JWT 토큰
 * @returns {string|null} - 이메일 또는 null
 */
export function getEmailFromToken(token) {
  const payload = decodeJWT(token);
  return payload?.sub || null;
}

/**
 * JWT 토큰에서 role을 추출합니다.
 * @param {string} token - JWT 토큰
 * @returns {string|null} - role 또는 null
 */
export function getRoleFromToken(token) {
  const payload = decodeJWT(token);
  return payload?.role || null;
}
