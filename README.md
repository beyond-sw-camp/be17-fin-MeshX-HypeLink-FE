<h1 align="center"> HypeLink (MeshX) </h1>
<div align="center"> 
 <img src="https://github.com/user-attachments/assets/807a5735-e104-4bbe-adf5-b7a47830b0cf" width="400"/>
</div>

> 이름 ‘HypeLink’는 “트렌드를 연결하다 (Hype + Link)”라는 의미를 담고 있습니다.  
> **브랜드와 소비자, 그리고 본사와 매장을 하나의 링크로 잇는** B2B 오프라인 매장 자동화 관리 플랫폼입니다.

---

## 🫂 팀원 소개
<table align="center">
  <tbody>
    <tr>
      <td align="center"><a href="https://github.com/kbw07"><img src="https://github.com/user-attachments/assets/706e1875-8a3d-4d3e-9a19-d344d6866f23" width="100px;" alt=""/><br /><sub><b> 강병욱 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/flionme"><img src="https://github.com/user-attachments/assets/08e896f8-c18f-454a-a44a-2337f585e77f" width="100px;" alt=""/><br /><sub><b> 김성인 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/David9733"><img src="https://github.com/user-attachments/assets/4d6ad9a1-ac42-4f36-9259-2b988493cf85" width="100px;" alt=""/><br /><sub><b> 이시욱 </b></sub></a><br /></td>
      <td align="center"><a href="https://github.com/raccoon-coding"><img src="https://github.com/user-attachments/assets/90a33761-0bd8-4b73-a12a-1e24f0c5a6a9" width="100px;" alt=""/><br /><sub><b> 최민성 </b></sub></a><br /></td>
    </tr>
  </tbody>
</table>

---

# 🎬 주문·재고 관리 시스템

## 🎯 프로젝트 소개

**HypeLink**는 스파(SPA) 브랜드와 오프라인 직영점을 위한 **B2B 통합 매장 관리 솔루션**입니다.  
본사와 매장을 하나의 네트워크로 연결하여, **주문·재고·물류·매출·고객 데이터**를 실시간으로 통합 관리할 수 있도록 설계되었습니다.

---

## 📘 프로젝트 개요

### 🔹 배경
최근 온라인 패션 브랜드들이 오프라인 매장을 확장하며 **옴니채널 전략**을 강화하고 있습니다.  
그러나 오프라인 운영 과정에서는 다음과 같은 문제들이 자주 발생합니다.

1. 점포별로 분산된 재고로 인해 **본사 차원의 통합 파악 어려움**
2. 물류 배송 상태를 실시간으로 추적하지 못해 **납기 지연 및 재고 손실 발생**
3. 매장별 POS·고객 데이터의 **파편화로 의사결정 지연**
4. 본사와 가맹점 간 **비효율적인 소통 채널 부재**

이러한 문제는 운영 효율성 저하와 매출 감소로 직결됩니다.

---

### 🔹 솔루션 개요
MeshX 팀은 이러한 문제를 해결하기 위해  
**GPS 기반 물류 추적, POS Health 모니터링, 고객 데이터 분석, 실시간 소통 허브**를 통합한  
**HypeLink 플랫폼**을 설계했습니다.

- 🚚 **실시간 물류 추적**: GPS 기반 배송 경로·도착 예측 실시간 시각화
- 🏢 **POS Health 모니터링**: 각 매장의 POS 상태를 본사에서 실시간 점검
- 👥 **고객 데이터 통계**: 연령·구매 성향 분석으로 맞춤형 마케팅 지원
- 💬 **실시간 커뮤니케이션 허브**: 본사–직영점 간 공지·이슈·요청 즉시 공유

---

## ✨ 주요 기능

### 🧭 GPS 기반 물류 추적
- 기사별 위치 데이터 기반 실시간 배송 경로 모니터링
- 지오코딩(Geocoding API)을 활용한 매장 좌표 자동 변환
- 근접 매장 탐색 및 최적 경로 계산

### 🏢 POS Health 모니터링
- 각 매장의 POS기 상태(정상/고장/대기)를 주기적 HealthCheck
- 비정상 응답 시 원격 접속 → AS 자동 요청 연계
- 고장 이력, 수리 내역, 평균 처리시간 보고서 자동 생성

### 👥 고객 데이터 관리 및 통계 시스템
- POS 결제 데이터를 기반으로 연령·성별·상품 카테고리별 매출 분석
- 인기/비인기 상품 랭킹, 재구매율, 시간대별 트래픽 분석
- 본사 대시보드에서 매출 패턴 시각화 및 프로모션 효과 분석

### 📦 재고 및 매출 관리
- 본사–직영점 간 재고 실시간 동기화 및 자동 발주 시스템
- 판매·입고·반품 등 이벤트 기반 재고 변동 자동 기록
- 가중치 기반 우선순위 출고(판매량이 높은 매장 우선)

### 💬 본사–직영점 실시간 커뮤니케이션
- WebSocket 기반 실시간 요청/응답 채널
- 매장에서 AS·지원요청 전송 시 본사 즉시 알림
- 공지사항, 이벤트, 업데이트 사항의 즉각적 공유

### 🧰 AS 관리 및 원격 지원
- HealthCheck 3회 실패 시 자동 AS 요청 등록
- 원격 접속 실패 시 현장 수리 기사 자동 배정
- AS 진행 상태(요청–접수–완료) 실시간 조회

---

## 🧭 프로젝트 시나리오

| 구분 | 시나리오 설명 | 기대 효과 |
|------|----------------|------------|
| 물류 추적 | GPS 데이터를 기반으로 기사 위치·도착 시간 실시간 추적 | 배송 지연율 감소, 고객 신뢰 향상 |
| 재고 관리 | 자동 입출고 및 반품 처리 시스템 구축 | 재고 회전율 향상, 손실 최소화 |
| POS 관리 | 본사에서 각 매장 POS 상태 모니터링 및 알림 | 장애 대응 속도 향상 |
| 고객 분석 | 연령대·구매패턴별 매출 분석 및 시각화 | 타겟 마케팅 효율성 증대 |
| 실시간 소통 | WebSocket 기반 공지/이슈 공유 채널 운영 | 현장 대응력 강화 및 협업 효율 개선 |

---

## 🛠 기술 스택

### ✔️Frontend
![Vue.js](https://img.shields.io/badge/vue.js-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![Pinia](https://img.shields.io/badge/Pinia-ffd859?style=for-the-badge&logoColor=black)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socketdotio&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E)
![Axios](https://img.shields.io/badge/Axios-671ddf?style=for-the-badge&logo=axios&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)

### ✔️Backend
![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring%20Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=white)
![Gradle](https://img.shields.io/badge/Gradle-02303A?style=for-the-badge&logo=gradle&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![QueryDSL](https://img.shields.io/badge/QueryDSL-4479A1?style=for-the-badge&logoColor=white)
![Lombok](https://img.shields.io/badge/Lombok-BC4125?style=for-the-badge&logoColor=white)

### ✔️Database
![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)

### ✔️Infra
![AWS S3](https://img.shields.io/badge/Amazon%20S3-569A31?style=for-the-badge&logo=amazons3&logoColor=white)
![Kaniko](https://img.shields.io/badge/Kaniko-2A2E35?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)

---

## 🧩 시스템 아키텍처
<a href="https://github.com/beyond-sw-camp/be17-fin-MeshX-HypeLink-FE/wiki/%EC%8B%9C%EC%8A%A4%ED%85%9C-%EC%95%84%ED%82%A4%ED%85%8D%EC%B3%90">시스템 아키텍처 문서 보기</a>

## 🧩 피그마 
<a href="https://www.figma.com/design/apT7cRFWE4TS6WcdayD1Tn/HypeLink?node-id=0-1&p=f&t=s8E79kwSqskjhKOT-0">피그마 문서 보기</a>
---

## ⚙️ 기술적 선택과 설계 배경
- **Spring Boot MVC** 구조로 서비스·도메인·컨트롤러 명확히 분리
- **JWT + Spring Security**로 안전한 인증/인가 구조 설계
- **QueryDSL**을 통한 복합 조건 검색 및 통계 쿼리 최적화
- **Kaniko + Jenkins + Kubernetes** 기반 CI/CD 파이프라인 구축
- **Blue-Green Deployment**로 무중단 배포 실현
- **WebSocket 기반 실시간 통신 서버**로 요청–응답 딜레이 최소화

---

## 🚀 서비스 목표
> “HypeLink는 오프라인 매장 관리의 복잡함을 데이터 중심으로 단순화한다.”

본사와 매장이 실시간으로 연결되고,  
모든 주문·재고·물류·POS·고객 정보가 투명하게 공유되는 환경을 구축함으로써  
**비용 절감, 매출 성장, 협업 효율성**을 동시에 실현하는 것이 목표입니다.

---
