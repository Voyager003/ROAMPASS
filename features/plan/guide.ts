import type { SimType } from '@/lib/api/types';

/**
 * Copy of the configure screen that depends on the SIM type (docs/decisions.md #38). Written for our
 * own flow (eSIM: QR after payment / USIM: airport pickup → ICCID registration) and refund rule
 * (installed or activated SIMs cannot be refunded, assignment §2.3-④). No claims the data cannot back
 * (network generation, device compatibility).
 */

export type Feature = { title: string; detail: string };

export const FEATURES: Record<SimType, Feature[]> = {
  ESIM: [
    { title: '바로 발급', detail: 'QR로 설치' },
    { title: '개통 후 계산', detail: '24시간 × 사용 일수' },
    { title: '설치 전 환불', detail: '미설치 시 전액' },
  ],
  USIM: [
    { title: '공항 수령', detail: '출국 당일' },
    { title: '개통 후 계산', detail: '24시간 × 사용 일수' },
    { title: '개통 전 환불', detail: '미개통 시 전액' },
  ],
};

export const NOTICE: Record<SimType, string> = {
  ESIM: 'eSIM은 지원 기종에서만 쓸 수 있어요. 구매 전에 휴대폰 설정에서 eSIM을 추가할 수 있는지 먼저 확인하세요.',
  USIM: '유심은 출국 당일 공항에서 받아요. 받은 카드의 ICCID를 내 SIM에서 등록하면 개통을 요청해요.',
};

export type GuideStep = { title: string; body: string };
export type GuideTab = { value: string; label: string; steps?: GuideStep[]; bullets?: string[] };

export const GUIDE_TABS: Record<SimType, GuideTab[]> = {
  ESIM: [
    {
      value: 'how',
      label: 'eSIM 사용 방법',
      steps: [
        { title: '결제하면 eSIM이 발급돼요', body: 'QR 코드와 활성화 코드는 보통 몇 초 안에 내 SIM에 나타나요. 창을 닫아도 발급은 계속돼요.' },
        { title: '출국 전에 미리 설치하세요', body: '안정적인 Wi-Fi가 되는 곳에서 QR 코드를 스캔해 설치해 두면 도착하자마자 쓸 수 있어요.' },
        { title: '도착하면 회선을 켜세요', body: '설정에서 eSIM 회선과 데이터 로밍을 켜면 개통되고, 그때부터 사용 기간이 시작돼요.' },
      ],
    },
    {
      value: 'before',
      label: '사용 전 확인',
      bullets: [
        '휴대폰이 eSIM을 지원하는지, 통신사 잠금이 해제되어 있는지 확인하세요.',
        '설치는 Wi-Fi가 연결된 곳에서 하세요.',
        'eSIM을 설치한 뒤에는 다른 기기로 옮길 수 없으니 여행에 쓸 기기에 설치하세요.',
      ],
    },
    {
      value: 'arrive',
      label: '도착 후 활성화',
      bullets: [
        '설정 > 셀룰러(모바일 데이터)에서 여행용 eSIM 회선을 켜세요.',
        '데이터 로밍을 켜면 현지 통신망에 연결돼요.',
        '사용 기간은 개통 시각부터 24시간 × 사용 일수예요. 만료 시각은 내 SIM에서 한국 시간으로 볼 수 있어요.',
      ],
    },
    {
      value: 'notes',
      label: '공통 유의',
      bullets: [
        '설치하거나 개통한 eSIM은 환불할 수 없어요. 설치 전이면 내 SIM에서 환불을 요청할 수 있어요.',
        '발급이 늦어지면 잠시 뒤 자동으로 발급 실패 처리되고 결제가 취소돼요.',
        '두 SIM을 함께 쓰면 데이터가 엉뚱한 회선으로 나갈 수 있으니 데이터 회선을 여행용으로 고르세요.',
      ],
    },
  ],
  USIM: [
    {
      value: 'how',
      label: 'USIM 사용 방법',
      steps: [
        { title: '결제하면 공항 수령 대기가 돼요', body: '출국 당일 공항 카운터에서 유심 카드를 받아요.' },
        { title: '카드의 ICCID를 등록하세요', body: '카드 뒷면의 19~20자리 번호를 내 SIM에서 입력하면 개통을 요청해요.' },
        { title: '도착하면 카드를 바꿔 끼우세요', body: '기존 유심을 빼고 여행용 유심을 넣은 뒤 데이터 로밍을 켜세요.' },
      ],
    },
    {
      value: 'before',
      label: '사용 전 확인',
      bullets: [
        '휴대폰의 통신사 잠금이 해제되어 있는지 확인하세요.',
        '유심 트레이를 여는 핀과 기존 유심을 보관할 곳을 챙기세요.',
      ],
    },
    {
      value: 'arrive',
      label: '도착 후 활성화',
      bullets: [
        '카드를 바꿔 끼우고 데이터 로밍을 켜면 현지 통신망에 연결돼요.',
        '사용 기간은 개통 시각부터 24시간 × 사용 일수예요.',
      ],
    },
    {
      value: 'notes',
      label: '공통 유의',
      bullets: [
        '개통된 유심은 환불할 수 없어요. 등록 전이면 내 SIM에서 환불을 요청할 수 있어요.',
        '자릿수나 체크 숫자가 틀린 ICCID, 이미 다른 주문에 등록된 ICCID는 등록되지 않아요.',
      ],
    },
  ],
};
