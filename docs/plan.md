# 작업 계획 · 체크리스트 (프론트엔드)

**작업 관리용** 문서.
요구사항 원문은 과제 PDF 2.1(개요)·2.3-⑤(어드민 화면)·2.3-⑥(사용자 화면)·2.4 질문 1·6번, 작업 규칙은 `CLAUDE.md`.
백엔드 계획은 `ROAMPASS_SERVER/docs/plan.md`. 백엔드는 P6(사용자 화면 API)까지 완료되어 이 저장소의 모든 화면이 실제 API에 붙는다.

## 계획의 근거

- **(2026-10-21) 이력을 새로 시작했다**(decisions #24). 이전 F0·F1(픽스처 기반 화면, 원격 미반영)은 로컬 백업 브랜치 `backup/before-restart`에 있고, 화면과 무관하게 검증된 코드만 정리해 F0에 다시 넣는다.
- **처음부터 실제 백엔드에 연결한다**(decisions #25). 실패 상태는 백엔드 장애 주입(`/mock/pg/config`, `/mock/supplier/config`, 공급사 프로필 상태 변경)으로 만든다. 명세 커버리지는 `docs/api-coverage.md`에서 추적.
- **사용자 화면은 시연 영상의 eSIM 구매 화면 구성을 따른다**(decisions #32~#38). 컴포넌트는 SEED, 브랜드 자산과 과제 밖 기능은 제외.
- **평가는 UI 완성도가 아니라 "Next.js에서 어떻게 구성했는지"**(2.3-⑥ 안내, 2.4 질문 6). 서버/클라이언트 경계, 발급 대기 갱신 방식, 라우터 선택 이유를 각 Phase에서 `decisions.md`에 적고 README Q1·Q6으로 모은다.
- **우선순위**: 과제 포기 순서(2.10)상 사용자 화면(⑥)이 어드민(⑤)보다 먼저 포기 대상. 그래도 구매 흐름(F1)을 먼저 만드는 이유는 그 화면이 없으면 어드민에서 볼 데이터가 생기지 않기 때문. 시간이 부족하면 F1-10(QR·유심 등록) → F1-9(내 SIM) → 유심 분기 순으로 줄인다.
- **신원은 로그인 없이 기본 데모 신원 + 바꾸기 칩**(decisions #4). 과제 2.2 "회원 시스템 불필요, 시간 쓰지 말 것".

## 진행 규칙 (요약, 상세는 CLAUDE.md §3)

- Phase마다 브랜치 `phase/f{N}-{이름}`. 시작 시 sub-step 목록을 확인받고, sub-step마다 코드 → 검증 → 커밋. 모든 sub-step이 끝나면 PR을 만들어 "Create a merge commit"으로 `main`에 머지(사용자가 PR 생성·머지).
- 범례: `[ ]` 대기 · `[~]` 진행 중 · `[x]` 완료 · `[-]` 포기(사유는 README "미구현" 절에)

---

## F0. 기반 — `phase/f0-foundation`

화면 없이 이후 Phase가 공유할 뼈대. 이전 이력에서 검증된 코드는 정리해서 다시 넣는다.

- [x] **F0-1** 문서: `CLAUDE.md`(새 계획 반영), `docs/plan.md`(이 문서), `docs/decisions.md`(유효한 결정 38건으로 정리), README 뼈대(2.5 항목만), `.env.example`
- [x] **F0-2** 의존성·스타일: SEED(`@seed-design/react`·`@seed-design/css`), Tailwind v4를 SEED 토큰에 연결(`app/globals.css`), 강조색 파랑, Vitest. 템플릿 `page.tsx`·`public/*.svg` 제거
- [x] **F0-3** 백엔드 계약: `lib/api/types.ts`(백엔드 응답 그대로), `lib/api/http-client.ts`(`BACKEND_URL`, `X-User-Id`/`X-Admin-Id`, 주문 생성 `Idempotency-Key`, 10초 타임아웃, `ProblemDetail` → `ApiError`), `client.ts`, `errors.ts`, `docs/api-coverage.md`
- [x] **F0-4** `lib/format`: KST 날짜·시각, 금액, 용량, 국가명, 상태 라벨(주문·결제·설치·환불·이상 건), actor 문자열, 환불 불가 사유, 발급 대기 행동 문구 + Vitest(시간대 3개)
- [x] **F0-5** 데모 신원: `lib/auth`(쿠키 없으면 기본값 `user-1`/`admin-1`, 고정 목록만 허용, server-only), 신원 바꾸기 칩(Server Action으로 쿠키 설정)
- [x] **F0-6** 셸과 공통 조각: 사용자 셸(하단 탭 홈 · 내 SIM, 화면 헤더 뒤로 · 제목 · 홈, 파란 세로 바 섹션 제목, 선택 칩 묶음, 하단 고정 CTA), 어드민 레이아웃(데스크톱 폭), 개발용 갤러리 `/ui`(프로덕션 404)
- 완료 기준: `npm run lint && npx tsc --noEmit && npm test && npm run build` 통과, 신원 칩으로 사용자·운영자 ID가 바뀌고, 셸·공통 조각이 `/ui`에서 모든 상태로 보임

## F1. 화면 · 로컬 연동 — `phase/f1-screens` — 과제 2.3-⑤·⑥

**범위(2026-10-21, decisions #39):** 구매 흐름·어드민·내 SIM 화면과 로컬 연동 확인을 한 브랜치에서. sub-step마다 lint·tsc·test·build와 계약 대조로 검증하고, 실제 백엔드와 띄워 보는 확인은 F1-11에서 한 번에. 끝나면 PR.

구매 흐름 (2.3-⑥ 구매)
- [x] **F1-1** 홈 `/`: 국가 카드 4개(JP·US·VN·TH) + 국가별 "단 N원부터"(국가 최저가). 요금제 목록은 서버에서 `'use cache'` + `cacheLife`
- [x] **F1-2** 구성 화면 `/plans/[country]`: 헤더 → 히어로(색 배경 + 문구) → "단 N원부터" → 기기 확인 안내 → 특징 3칸(SIM 종류별) → 여행 시작일 달력(하루만, KST 오늘~1년) → 사용기간 → 데이터 → SIM(존재하는 값만) → 사용자 가이드(주의 Callout + 탭 4개, SIM 종류별) → 옵션 선택 정보(시작일·SIM·사용기간·데이터·결제금액, "개통 시점부터 N일") → 하단 고정 "결제하러 가기"(요금제 1개로 좁혀지면 활성). 선택 상태는 `useState`
- [x] **F1-3** 주문 생성: 폼 렌더 시 멱등 키(숨은 입력) → Server Action `createOrder` → `/orders/[orderNo]`로 redirect. 400·404·409 안내
- [x] **F1-4** `/orders/[orderNo]` 결제 단계: 주문 요약, 결제 기한 카운트다운(`GET /api/orders/{orderNo}`의 `expiresAt`), 결제 버튼 → Server Action(`paymentStatus=REQUESTED`·409 `PAYMENT_IN_PROGRESS`는 "결제 확인 중"), 기한 만료 화면
- [x] **F1-5** `/orders/[orderNo]` 발급 대기: `<Poller>`(`waiting.pollIntervalSeconds`, 탭 숨김 시 정지, 끝 상태에서 종료) + `waiting.stage/overdue/actions`로 "발급이 늦을 때 할 수 있는 일" + 환불 요청 Server Action. 유심은 `PICKUP_READY` 화면(공항 수령 안내 → 내 SIM에서 ICCID 등록)

어드민 (2.3-⑤ 화면)
- [x] **F1-6** `/admin/orders` 목록: 주문 상태·결제 상태(최근 시도)·설치 상태·SIM 종류·기간 필터 + 페이지네이션(최대 50)을 `searchParams`로. `asOf` 기반 "N초 전 데이터" + 새로고침 버튼
- [x] **F1-7** `/admin/orders/[orderNo]` 상세 + 운영자 조치: 상태 변경 이력 **한 줄 타임라인**(언제·무엇이·누가/어떤 신호로), 결제 시도·발급 요청·프로필·환불 요청·콜백 기록. 수동 환불·발급 재시도(사유 필수, 진행 중 비활성화, 409는 "이미 처리됨/할 수 없음")
- [x] **F1-8** `/admin/issues` 처리 대기(이전 이름 이상 건, decisions #46): 결제 후 N분 미발급 / 환불 실패 / 금액 불일치 / 서명 불일치

내 SIM (2.3-⑥ 내 SIM)
- [x] **F1-9** `/my/sims` 목록 + `/my/sims/[orderNo]` 상세: 결제 금액, 발급·설치 상태, 남은 기간(KST 만료 시각), 환불 가능 여부와 사유, 환불 요청
- [x] **F1-10** QR / 활성화 코드(버튼을 눌러야 열림 → `qr-viewed` 기록 후 표시) + 유심 ICCID 등록 폼(클라이언트 측 자릿수·Luhn 검증, 400·409 안내)

연동 확인
- [x] **F1-11** 로컬 백엔드(백엔드 compose `--profile app`으로 4개 컨테이너)와 함께 띄워 `docs/api-coverage.md` 전 항목 `[x]`, 장애 주입(지연·실패·중복·콜백 누락·서명 오류)으로 상태 확인, 발견한 차이 수정(테두리·운영자 링크·환불 안내·처리 대기·스피너). README **시연 방법**·**Q6**은 F3 최종 README로 이동. 백엔드 P7-3 "프론트와 연동 확인"도 이것으로 완료
- [x] 결정: 폴링 간격·상한(#42), QR 렌더 방식(#44), 카운트다운·어드민 자동 갱신·타임라인 신호 표기·ICCID 클라이언트 검증 범위(#47)
- 완료 기준: 로컬에서 홈 → 구성 → 주문 → 결제 → 발급 대기 → `ISSUED`, 장애 주입으로 `REFUNDING`/`REFUNDED`, 어드민 이상 건·조치(두 운영자 동시 클릭 1회), 내 SIM 설치 상태 5단계가 모두 동작

## F2. 배포 — `phase/f2-deploy` — 2.5-②, 백엔드 P7(배포) 이후

- [ ] Vercel 프로젝트 연결, `BACKEND_URL` 환경변수, 배포된 백엔드와 연결 확인
- [ ] 사용자 화면·어드민 화면 모두 공개 URL로 접속 확인
- [ ] README: **배포** 절(어디에·왜·막혔던 지점)은 F3 최종 README에서 함께 작성
- 완료 기준: 공개 URL 1개로 두 화면 모두 동작

## F3. 제출 마감 — `phase/f3-submission` — 2.5, 부록 B

- [ ] README **시연 방법**·**배포**, Q1~Q8 다듬기(프론트 관점. Q1·Q6·Q7 중심, Q2~Q5는 백엔드 README 링크 + 프론트가 의존하는 부분만)
- [ ] **미구현 · 타협** 절, **가정** 절, **투입 시간 · AI 사용처**
- [ ] 새 디렉터리에 `git clone` 후 README 커맨드만으로 실행 재현, `git log -p | grep -iE "password|secret|token"`
- 완료 기준: 부록 B 체크리스트 중 프론트 해당 항목 전부 체크

---

## 미결 질문 (결정 시 `docs/decisions.md`)

| # | 질문 | 결정 Phase |
|---|---|---|
| 1 | ~~폴러 자체의 시간 상한~~ → 결정 #42(끝 상태 + 5분 상한) | F1-5 |
| 2 | ~~QR 렌더 방식~~ → 결정 #44(텍스트만) | F1-10 |
| 3 | 백업 브랜치 `backup/before-restart`를 언제 지울지 | F3 |
