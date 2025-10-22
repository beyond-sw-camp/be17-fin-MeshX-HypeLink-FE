import api from "@/plugins/axiosinterceptor";
import axios from "axios";

/**
 * 공지사항용 Presigned URL 발급
 */
export const getNoticeImagePresignedUrl = async (file) => {
  const requestUrl = `/api/image/presigned/notice`;
  let data = {};
  await api
    .post(requestUrl, {
      originalFilename: file.name,
      contentType: file.type,
    })
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

/**
 * 상품용 Presigned URL 발급
 */
export const getItemImagePresignedUrl = async (file) => {
  const requestUrl = `/api/image/presigned/item`;
  let data = {};
  await api
    .post(requestUrl, {
      originalFilename: file.name,
      contentType: file.type,
    })
    .then((response) => {
      data = response.data;
    })
    .catch((error) => {
      data = error.response?.data || error.message;
    });
  return data;
};

/**
 * S3에 직접 파일 업로드 (Presigned URL 사용)
 */
export const uploadToS3 = async (presignedUrl, file) => {
  try {
    await axios.put(presignedUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
    return true;
  } catch (error) {
    console.error("S3 업로드 실패:", error);
    return false;
  }
};

/**
 * 공지사항 이미지 업로드 전체 프로세스
 * 1. Presigned URL 발급
 * 2. S3 업로드
 * 3. s3Key 반환
 */
export const uploadNoticeImage = async (file) => {
  try {
    // 1. Presigned URL 발급
    const presignedResponse = await getNoticeImagePresignedUrl(file);
    if (!presignedResponse.data) {
      throw new Error("Presigned URL 발급 실패");
    }

    const { uploadUrl, s3Key } = presignedResponse.data;

    // 2. S3에 업로드
    const uploadSuccess = await uploadToS3(uploadUrl, file);
    if (!uploadSuccess) {
      throw new Error("S3 업로드 실패");
    }

    // 3. 이미지 정보 반환
    return {
      originalFilename: file.name,
      fileSize: file.size,
      contentType: file.type,
      s3Key: s3Key,
    };
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    throw error;
  }
};

/**
 * 상품 이미지 업로드 전체 프로세스
 */
export const uploadItemImage = async (file) => {
  try {
    const presignedResponse = await getItemImagePresignedUrl(file);
    if (!presignedResponse.data) {
      throw new Error("Presigned URL 발급 실패");
    }

    const { uploadUrl, s3Key } = presignedResponse.data;

    const uploadSuccess = await uploadToS3(uploadUrl, file);
    if (!uploadSuccess) {
      throw new Error("S3 업로드 실패");
    }

    return {
      originalFilename: file.name,
      fileSize: file.size,
      contentType: file.type,
      s3Key: s3Key,
    };
  } catch (error) {
    console.error("이미지 업로드 실패:", error);
    throw error;
  }
};

export default {
  getNoticeImagePresignedUrl,
  getItemImagePresignedUrl,
  uploadToS3,
  uploadNoticeImage,
  uploadItemImage,
};