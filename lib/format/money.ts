import type { Money } from '@/lib/api/types';

const krw = new Intl.NumberFormat('ko-KR');
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/** KRW → "12,900원". USD (cents) → "$12.34". Amounts arrive in the currency's minor unit. */
export function formatMoney(money: Money): string {
  switch (money.currency) {
    case 'KRW':
      return `${krw.format(money.amount)}원`;
    case 'USD':
      return usd.format(money.amount / 100);
  }
}

/** 3072 → "3GB", 1536 → "1.5GB", 500 → "500MB". */
export function formatDataMb(mb: number): string {
  if (mb < 1024) return `${mb}MB`;
  const gb = mb / 1024;
  return Number.isInteger(gb) ? `${gb}GB` : `${gb.toFixed(1)}GB`;
}
