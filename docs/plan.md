# 작업 계획 · 체크리스트 (프론트엔드)

**작업 관리용** 문서.
요구사항 원문은 과제 PDF 2.3-⑤(어드민 화면)·2.3-⑥(사용자 화면)·2.4 질문 1·6번, 작업 규칙은 `CLAUDE.md`.
백엔드 계획은 `ROAMPASS_SERVER/docs/plan.md`. 여기에는 백엔드 **의존 시점**만 표기.

## 계획의 근거

- **화면·컴포넌트를 먼저, API 연동은 백엔드 완료 뒤에.** 백엔드가 아직 P0(기반) 단계라 API가 없다. 그래서 F0~F3은 백엔드 상태 전이도를 그대로 옮긴 **픽스처 데이터**로 모든 화면을 모든 상태에서 만들어 두고, F4에서 픽스처 구현을 HTTP 구현으로 바꾼다. 화면은 어느 구현이 뒤에 있는지 모른다.
- **평가는 UI 완성도가 아니라 "Next.js에서 어떻게 구성했는지"(2.3-⑥ 안내, 2.4 질문 6)**. 서버/클라이언트 경계, 발급 대기 갱신 방식, 라우터 선택 이유를 각 Phase에서 `decisions.md`에 적고 README Q6으로 모은다.
- **우선순위**: 과제 포기 순서상 사용자 화면(⑥)이 어드민(⑤)보다 먼저 포기 대상이다. 그래도 구매 흐름(F1)을 먼저 만드는 이유는 그 화면이 없으면 어드민에서 볼 데이터가 생기지 않기 때문. 시간이 부족하면 F3(내 SIM 상세의 세부 항목) → F1의 유심 분기 순으로 줄인다.
- **배포는 Vercel 무료 티어.** 프론트 배포 자체는 처음 보는 작업이 적으므로 F4 직후 한 번에 한다. 단 백엔드 배포(P4)가 끝나 공개 API URL이 생겨야 의미가 있다.

## 진행 규칙 (요약, 상세는 CLAUDE.md §3)

- Phase마다 브랜치 `phase/f{N}-{이름}`. 시작 시 sub-step 목록을 확인받고, sub-step마다 코드 → 검증 → 커밋. 모든 sub-step이 끝나면 확인 후 `main`에 `--no-ff` 머지.
- 범례: `[ ]` 대기 · `[~]` 진행 중 · `[x]` 완료 · `[-]` 포기(사유는 README "미구현" 절에)

---

## F0. 기반 — `phase/f0-foundation`

"clone 후 README 커맨드로 뜬다"와 이후 Phase가 공유할 뼈대를 만드는 Phase. 화면은 없다.

- [ ] **F0-1** `git init`, `CLAUDE.md`, `docs/plan.md`, `docs/decisions.md`, README 뼈대(2.5 항목만), `.env.example`
- [ ] **F0-2** 타입과 상태 정의 — `lib/api/types.ts`
  - 백엔드 `plan.md`의 상태 전이 초안을 그대로 옮김: 주문 `PENDING / PAID / ISSUE_REQUESTED / ISSUED / ISSUE_FAILED / REFUNDED / NEEDS_ATTENTION / EXPIRED / PICKUP_READY / ACTIVE`, 결제 `REQUESTED / APPROVED / FAILED / CANCELLED / PARTIALLY_CANCELLED`, 설치 `ISSUED / QR_VIEWED / INSTALLED / ACTIVE / EXPIRED`
  - Plan / Order / Payment / SimProfile / StatusHistory / RefundAttempt / 어드민 목록·이상 건 응답 타입. 필드는 부록 A 데이터 모델 힌트 기준, 백엔드 확정 시 F4에서 맞춤
  - 어느 상태가 "끝 상태"인지(폴러 종료 조건)를 타입 옆에 상수로
- [ ] **F0-3** `lib/api/client.ts` 인터페이스 + 픽스처 구현(`lib/fixtures/`) — 모든 상태를 최소 1건씩 포함하는 주문 데이터. `server-only`
- [ ] **F0-4** `lib/format` — KST 날짜·시각 포맷, 금액 포맷, 상태 라벨·색상 매핑(enum 전수). Vitest 도입 + 자정 경계·라벨 전수 테스트
- [ ] **F0-5** 쿠키 신원 — `/login`(사용자 ID·운영자 ID 선택), `lib/auth`(server-only 읽기), `proxy.ts`(`/admin/**` 운영자 쿠키 없으면 `/login`)
- [ ] **F0-6** 레이아웃·UI 프리미티브 — 루트 레이아웃(한국어, 폰트), `(user)`·`admin` 레이아웃(내비게이션), `components/ui`(Button, Badge, Card, Table, PageHeader, EmptyState). 템플릿 page.tsx·svg 제거
- [ ] **F0-7** README 초안: **실행 방법**, **Q1**(App Router·Cache Components·BFF·Tailwind·라이브러리 미사용 이유) + decisions 갱신
- 완료 기준: `npm run lint && npx tsc --noEmit && npm run build` 통과, `/login`에서 ID를 고르면 쿠키가 생기고 `/admin`은 운영자 쿠키 없이는 `/login`으로 감

## F1. 구매 흐름 화면 — `phase/f1-purchase` — 과제 2.3-⑥ 구매 (픽스처)

- [ ] **F1-1** `/` 요금제 목록: 국가·일수·용량·SIM 종류 필터를 `searchParams`로. 요금제 조회는 `'use cache'` + `cacheLife`
- [ ] **F1-2** `/plans/[id]` 요금제 상세 + 여행 시작일 선택 → 주문 생성 Server Action(픽스처는 주문번호만 반환) → `/orders/[orderNo]`로 redirect
- [ ] **F1-3** `/orders/[orderNo]` 결제 단계: 주문 요약, 결제 대기 만료 카운트다운(클라이언트 컴포넌트, 서버가 준 `expiresAt` 기준), 결제 버튼 → Server Action(`Idempotency-Key` 헤더용 키는 페이지 렌더 시 생성, 진행 중 비활성화). `EXPIRED` 상태 화면
- [ ] **F1-4** `/orders/[orderNo]` 발급 대기 단계: `<Poller>`(2초×30초 → 5초, 탭 숨김 시 정지, 끝 상태·시간 상한에서 종료) + 상태별 화면(`PAID`/`ISSUE_REQUESTED` 진행 중, `ISSUED` 완료 → 내 SIM 링크, `ISSUE_FAILED`/`REFUNDED`/`NEEDS_ATTENTION` 안내). **발급이 늦을 때 사용자가 할 수 있는 일**(창 닫아도 계속됨 안내, 내 SIM 링크, 환불 정책)
- [ ] **F1-5** 유심 분기: 결제 완료 시 `PICKUP_READY` 화면(공항 수령 안내, ICCID 등록은 F3)
- [ ] 결정: 폴링 간격·상한, 카운트다운을 클라이언트에서 도는 이유, 멱등 키 생성 위치
- [ ] README 초안: **Q6** 사용자 화면 쪽(발급 대기 결과를 받는 방식과 이유, 브라우저를 닫으면)
- 완료 기준: 픽스처의 모든 주문 상태에서 `/orders/[orderNo]`가 깨지지 않고, 폴러가 끝 상태에서 멈추는 것을 브라우저에서 확인

## F2. 어드민 화면 — `phase/f2-admin` — 과제 2.3-⑤ 화면 (픽스처)

- [ ] **F2-1** `/admin/orders` 목록: 결제 상태·발급/설치 상태·SIM 종류·기간 필터 + 페이지네이션을 `searchParams`로. `asOf` 기반 "N초 전 데이터" 표시 + 새로고침 버튼(`router.refresh()`)
- [ ] **F2-2** `/admin/orders/[orderNo]` 상세: 상태 변경 이력 **한 줄 타임라인**(언제·무엇이·누가/어떤 신호로), 결제·프로필·환불 시도·콜백 로그
- [ ] **F2-3** 운영자 조치: 수동 환불·발급 재시도 — 사유 필수 폼, 멱등 키, 진행 중 비활성화, 결과(이미 처리됨 포함) 표시
- [ ] **F2-4** `/admin/issues` 이상 건: 결제됐는데 N분 미발급 / 환불 실패·상한 초과 / 금액 불일치 / 서명 실패를 유형별로
- [ ] 결정: 어드민 자동 갱신을 하지 않는 이유, 타임라인의 "신호" 표기 방식
- [ ] README 초안: **Q6** 어드민 쪽(운영자가 보는 데이터가 몇 초 전인지 드러낸 방법)
- 완료 기준: 픽스처의 이상 건이 `/admin/issues`에 보이고 상세에서 조치 폼이 동작(픽스처는 결과만 반환)

## F3. 내 SIM 화면 — `phase/f3-my-sims` — 과제 2.3-⑥ 내 SIM (픽스처)

- [ ] **F3-1** `/my/sims` 목록: 상태·남은 기간 요약
- [ ] **F3-2** `/my/sims/[id]` 상세: 결제 금액, 발급·설치 상태, 남은 기간(KST), 환불 가능 여부와 사유
- [ ] **F3-3** QR / 활성화 코드: 버튼을 눌러야 열림 → Server Action으로 `qr-viewed` 기록 후 표시(우리가 직접 기록하는 유일한 신호). QR 라이브러리 도입 여부 결정
- [ ] **F3-4** 유심 ICCID 등록 폼: 클라이언트 측 자릿수·Luhn 검증(백엔드 검증을 대신하지 않음), 중복·오류 응답 표시
- [ ] 결정: QR 렌더 방식, ICCID 클라이언트 검증 범위
- 완료 기준: 설치 상태 5단계 모두에서 상세가 올바른 안내를 보여줌

## F4. 백엔드 연동 — `phase/f4-integration` — 백엔드 P8 이후

- [ ] **F4-1** 백엔드 실제 응답과 `types.ts` 대조, 차이 반영(컴파일러가 영향 화면을 찾음)
- [ ] **F4-2** `lib/api/client.ts` HTTP 구현: `BACKEND_URL`, `X-User-Id`/`X-Admin-Id`, `Idempotency-Key`, 타임아웃, 오류 매핑. 픽스처 구현 제거
- [ ] **F4-3** 로컬 백엔드(`ROAMPASS_SERVER` README)와 구매 → 발급 대기 → 내 SIM → 어드민 조치 전 과정 확인. 장애 주입(지연·실패·중복) 켠 상태에서 화면이 올바른 안내를 보이는지 확인
- [ ] README: **시연 방법**(프론트에서 보는 장애 시나리오), Q6 최종
- 완료 기준: 백엔드 장애 주입 상태에서도 사용자·어드민 화면이 깨지지 않음

## F5. 배포 — `phase/f5-deploy` — 2.5-②, 백엔드 P4 이후

- [ ] Vercel 프로젝트 연결, `BACKEND_URL` 환경변수, 배포된 백엔드와 연결 확인
- [ ] 사용자 화면·어드민 화면 모두 공개 URL로 접속 확인
- [ ] README: **배포** 절(어디에·왜·막혔던 지점)
- 완료 기준: 공개 URL 1개로 두 화면 모두 동작

## F6. 제출 마감 — `phase/f6-submission` — 2.5, 부록 B

- [ ] README Q1~Q8 다듬기(프론트 관점. Q1·Q6·Q7 중심, Q2~Q5는 백엔드 README 링크 + 프론트가 의존하는 부분만)
- [ ] **미구현 · 타협** 절, **가정** 절, **투입 시간 · AI 사용처**
- [ ] 새 디렉터리에 `git clone` 후 README 커맨드만으로 실행 재현, `git log -p | grep -iE "password|secret|token"`
- 완료 기준: 부록 B 체크리스트 중 프론트 해당 항목 전부 체크

---

## 미결 질문 (결정 시 `docs/decisions.md`)

| # | 질문 | 결정 Phase |
|---|---|---|
| 1 | 백엔드 응답 JSON 형태(필드명·페이지네이션 형식·오류 형식) — 백엔드 구현 뒤 확정 | F4 |
| 2 | 폴링 시간 상한(몇 분 뒤 "늦어지고 있어요" 화면으로 전환할지) — 백엔드 콜백 타임아웃 기본값(P3 결정)과 맞춤 | F1, F4 |
| 3 | QR 코드를 라이브러리로 그릴지, 활성화 코드 텍스트로만 보여줄지 | F3 |
| 4 | 어드민 "이상 건" 유형 목록 — 백엔드 P5 결정을 따름 | F2, F4 |
| 5 | `/login`의 ID 목록을 고정값으로 둘지 자유 입력으로 둘지 | F0 |
