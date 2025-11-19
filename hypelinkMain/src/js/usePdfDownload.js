import html2pdf from 'html2pdf.js';

export function usePdfDownload() {
    /**
     * 지정된 HTML 요소를 PDF로 다운로드
     * @param {string} elementId - PDF로 변환할 HTML 요소의 ID
     * @param {string} filename - 저장될 파일명 (기본값: '문서')
     */
    const downloadPDF = (elementId, filename = '문서') => {
        const element = document.getElementById(elementId);

        if (!element) {
            console.error(`PDF로 변환할 요소를 찾을 수 없습니다: ${elementId}`);
            alert('PDF로 변환할 내용을 찾을 수 없습니다.');
            return;
        }

        // 현재 날짜를 파일명에 추가
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const fullFilename = `${filename}_${today}.pdf`;

        const options = {
            margin: 10, // 여백 (mm)
            filename: fullFilename,
            image: {
                type: 'jpeg',
                quality: 0.98 // 이미지 품질
            },
            html2canvas: {
                scale: 2, // 해상도 (높을수록 선명)
                useCORS: true, // 외부 이미지 처리
                letterRendering: true // 텍스트 렌더링 개선
            },
            jsPDF: {
                unit: 'mm',
                format: 'a4', // A4 용지
                orientation: 'portrait' // 세로 방향 (landscape: 가로)
            }
        };

        // PDF 생성 및 다운로드
        html2pdf().set(options).from(element).save();
    };

    return {
        downloadPDF
    };
}
