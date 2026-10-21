# 백엔드 API 커버리지 (프론트 기준)

백엔드(`ROAMPASS_SERVER`)가 제공하는 사용자·어드민 API 전부를 프론트가 쓰는지 확인하는 표.
각 Phase의 sub-step이 끝날 때 "사용 화면"과 "확인" 칸을 채운다. 웹훅·콜백(`/api/payments/webhook`, `/api/issuance/callback`)과 mock 서버의 `/mock/**`는 서버 간 호출이라 프론트 대상이 아니다.

범례: `[ ]` 미사용 · `[~]` 클라이언트 메서드만 있음 · `[x]` 화면에서 사용하고 브라우저로 확인

| # | 백엔드 API | 헤더 | `lib/api/client.ts` 메서드 | 사용 화면 | 상태 | 확인한 응답·오류 |
|---|---|---|---|---|---|---|
| 1 | `GET /api/plans?country&simType&days&dataMb` | 없음 | `listPlans` | `/` 국가 카드·최저가(F1-1, `features/plan/queries.ts` `getPlans`), `/plans/[country]` 구성 화면(F1-2) | [x] | |
| 2 | `POST /api/orders` `{planId, travelStartDate}` + `Idempotency-Key` → 201 | X-User-Id | `createOrder` | `/plans/[country]` 결제하러 가기(F1-3, `features/order/actions.ts` `createOrderAction`) | [x] | 400 `INVALID_REQUEST`·`INVALID_TRAVEL_START_DATE`·`INVALID_IDEMPOTENCY_KEY`, 404 `PLAN_NOT_FOUND`, 409 `IDEMPOTENCY_KEY_REUSED`, 같은 키 재제출 → 같은 주문 |
| 3 | `GET /api/orders/{orderNo}` (`expiresAt` 포함) | X-User-Id | `getOrder` | `/orders/[orderNo]` 결제 대기 단계의 만료 카운트다운·주문 요약·만료 화면(F1-4, `features/order/queries.ts` `getOrder`). 그 외 정보는 `GET /api/sims/{orderNo}`가 상위 집합 | [x] | 404 `ORDER_NOT_FOUND` |
| 4 | `POST /api/orders/{orderNo}/pay` → `{paymentStatus, orderStatus}` | X-User-Id | `payOrder` | `/orders/[orderNo]` 결제하기(F1-4, `features/order/actions.ts` `payOrderAction`, 결과 문구 `features/order/payment.ts`) | [x] | 409 `ORDER_NOT_PAYABLE`·`PAYMENT_IN_PROGRESS`, `paymentStatus=REQUESTED`(PG 응답 유실) |
| 5 | `GET /api/sims?page&size` | X-User-Id | `listMySims` | `/my/sims`(F1-9, `features/sim/queries.ts`, 20건씩 `?page`) | [x] | 400 `INVALID_PAGE` |
| 6 | `GET /api/sims/{orderNo}` (`refundable`, `sim`, `waiting`) | X-User-Id | `getMySim` | `/orders/[orderNo]` 결제 후 단계(F1-5, `features/order/queries.ts` `getMySim`: `waiting`·결과 화면), `/my/sims/[orderNo]`(F1-9, `features/sim/components/sim-detail.tsx`: 설치 5단계·남은 기간·만료 KST·환불 가능 여부) | [x] | 404 `ORDER_NOT_FOUND`, `waiting.stage`·`overdue`·`actions` |
| 7 | `POST /api/sims/{orderNo}/qr-viewed` → 204 | X-User-Id | `markQrViewed` | `/my/sims/[orderNo]` 설치 코드 보기(F1-10, `features/sim/actions.ts` `revealActivationCodeAction`: 기록 후 코드 조회) | [x] | 404 `SIM_NOT_FOUND` |
| 8 | `POST /api/orders/{orderNo}/usim/register` `{iccid}` | X-User-Id | `registerUsimIccid` | `/my/sims/[orderNo]` 유심 등록(F1-10, `registerIccidAction`, 클라이언트 19~20자리·Luhn 검사 `features/sim/iccid.ts`) | [x] | 400 `INVALID_ICCID`, 409 `ORDER_NOT_REGISTRABLE`·`ICCID_ALREADY_REGISTERED`·`CONFLICT` |
| 9 | `POST /api/orders/{orderNo}/refund` → 202 | X-User-Id | `requestRefund` | `/orders/[orderNo]` 발급 대기 `REQUEST_REFUND`(F1-5, `features/order/actions.ts` `refundOrderAction`), `/my/sims/[orderNo]` 환불 요청(F1-9, `refundable`일 때만 버튼) | [x] | 409 `ORDER_NOT_REFUNDABLE`·`SIM_NOT_REFUNDABLE`·`REFUND_CONFLICT` |
| 10 | `GET /admin/orders?status&paymentStatus&installStatus&simType&from&to&page&size` | X-Admin-Id | `listAdminOrders` | `/admin/orders`(F1-6, `features/admin/queries.ts`, 필터는 `searchParams` → `features/admin/order-filter.ts`: KST 날짜 → UTC `from` 포함·`to` 다음날 0시 제외) | [x] | 401 `MISSING_ADMIN_ID`, 400 `INVALID_PAGE`, `asOf` |
| 11 | `GET /admin/orders/{orderNo}` | X-Admin-Id | `getAdminOrder` | `/admin/orders/[orderNo]`(F1-7, `features/admin/queries.ts`: 한 줄 타임라인 + 결제·발급·프로필·환불·콜백 기록) | [x] | `timeline[].actor` 문자열, `callbacks[]` |
| 12 | `GET /admin/issues` | X-Admin-Id | `listAdminIssues` | `/admin/issues` "처리 대기"(F1-8, `features/admin/queries.ts`. `?type=` 묶음 필터 + 표, 주문 묶음은 상세 링크, 통지 묶음은 응답에 주문번호가 없어 링크 없음) | [x] | 4개 묶음 + `stuckThresholdMinutes` |
| 13 | `POST /admin/orders/{orderNo}/refund` `{reason}` | X-Admin-Id | `refundOrder` | `/admin/orders/[orderNo]` 수동 환불(F1-7, `features/admin/actions.ts` `manualRefundAction`) | [x] | 400 `ADMIN_REASON_REQUIRED`, 409 `ORDER_NOT_REFUNDABLE`·`SIM_NOT_REFUNDABLE`·`ACTION_CONFLICT` |
| 14 | `POST /admin/orders/{orderNo}/reissue` `{reason}` | X-Admin-Id | `reissueOrder` | `/admin/orders/[orderNo]` 발급 재시도(F1-7, `features/admin/actions.ts` `reissueAction`) | [x] | 409 `ORDER_NOT_REISSUABLE`·`ACTION_CONFLICT` |

## 백엔드 명세 중 프론트가 쓰지 않기로 한 것

- 백엔드 CORS 설정(`roampass.cors.*`): 브라우저가 백엔드를 직접 부르지 않는 BFF 구조라 거치지 않는다.

## 최종 확인 (F1-11)

백엔드 장애 주입(PG 지연·승인 실패·웹훅 중복, 공급사 발급 실패·콜백 누락)을 켠 상태로 위 화면을 모두 돌려 보고, 화면이 깨지지 않고 올바른 안내를 보이는지 확인한다. 결과는 README "시연 방법"에 적는다.
