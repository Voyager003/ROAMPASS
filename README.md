# ROAMPASS

여행자용 유심(USIM)·이심(eSIM) 판매 서비스 **ROAMPASS**의 클라이언트 프로젝트

---

## 1. 실행 방법

### 사전 요구사항
- Node.js 20.9 이상(Next.js 16 최소 버전), npm 10 이상
- Docker, Docker Compose v2 (백엔드 실행용)

### 로컬 실행

화면의 모든 데이터는 Spring 백엔드에서 오므로 **서버를 먼저 띄웁니다.**

```bash
# 1) 서버 구동
git clone https://github.com/Voyager003/ROAMPASS_SERVER.git
cd ROAMPASS_SERVER
cp .env.example .env
docker compose --profile app up -d --build
curl http://localhost:8080/actuator/health   # status가 UP이면 준비 완료
cd ..

# 2) 클라이언트 실행
git clone https://github.com/Voyager003/ROAMPASS.git
cd ROAMPASS
npm ci
cp .env.example .env.local
npm run dev
```

---

## 2. Q&A

### 2.1 기술 선택

#### 라우터: App Router

백엔드 호출을 서버에서만 하도록 경계를 파일 단위로 나누기 위해 App Router를 선택했습니다. 

서버 컴포넌트가 기본이라 데이터를 읽는 코드는 브라우저 번들에 들어가지 않고, 상태나 이벤트가 필요한 부분만 'use client' 파일로 분리됩니다. 

사용자 화면(app/(user))과 운영자 화면(app/admin)은 라우트 그룹으로 나눠 한 애플리케이션에 두었습니다.

#### 데이터 패칭: 서버 컴포넌트의 서버 `fetch`

Next.js가 서버 fetch를 캐시와 함께 확장하는 기본 경로이며, 호출 지점이 한 파일뿐이라 별도 라이브러리가 필요 없었기 때문입니다. 

캐시는 모든 사용자에게 같고 자주 바뀌지 않는 요금제 목록에만 'use cache'를 적용했고, 주문·결제·발급 데이터는 요청마다 새로 읽습니다. 

발급 대기 화면은 router.refresh()로 서버 컴포넌트를 주기적으로 다시 그려 결과를 받습니다.

#### 상태 관리

화면 사이에서 공유되는 클라이언트 상태가 없고, 간단한 화면을 공유하는 기능이기 때문에 별도의 상태 관리 라이브러리를 도입하지 않았습니다. 

주문·결제·발급 상태는 클라이언트에 보관하지 않고 서버 컴포넌트가 매번 읽으며, 운영자 목록의 필터는 URL에, 신원은 cookie에 둡니다.

클라이언트 상태는 구성 화면의 선택(여행 시작일·사용기간·데이터·SIM)이 있는데, PlanConfigurator의 useState에 두고, 달력과 선택 칩에는 현재 값(value)과 변경 함수(onValueChange)를 props로 넘깁니다. 

요금제 목록·오늘 날짜·주문 생성 Server Action은 서버 컴포넌트(ConfigureScreen)가 props로 내려 줍니다. 

그 밖에 폼의 진행 중 상태는 각 폼의 useActionState로, 결제 기한 카운트다운 같은 시간 표시는 해당 컴포넌트의 useState로 처리했습니다.

---

## 3. 배포

**Vercel**을 선택했습니다. 화면이 완성되면 간단하게 배포가 가능하고 익숙한 도구여서 선택했습니다.
