import Link from 'next/link';
import type { ReactNode } from 'react';

import { ChevronDownIcon } from '@/components/shell/icons';
import {
  INSTALL_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  SIM_TYPES,
} from '@/lib/api/types';
import {
  INSTALL_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SIM_TYPE_LABELS,
} from '@/lib/format/labels';

import { type AdminOrderQuery, PAGE_SIZES } from '../order-filter';

/**
 * Filter bar of the admin order list. A plain GET form: submitting navigates to
 * /admin/orders?…, which the page reads as searchParams, so no client state is needed and the
 * filtered URL can be shared. Changing a filter starts again from the first page (no `page` field).
 */
export function OrderFilterForm({ query }: { query: AdminOrderQuery }) {
  return (
    <form method="get" action="/admin/orders" className="mb-4 flex flex-wrap items-end gap-3 rounded-card bg-layer p-4">
      <Field label="주문 상태">
        <Select name="status" value={query.status}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="결제 상태(최근 시도)">
        <Select name="paymentStatus" value={query.paymentStatus}>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="설치 상태">
        <Select name="installStatus" value={query.installStatus}>
          {INSTALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {INSTALL_STATUS_LABELS[s].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="SIM 종류">
        <Select name="simType" value={query.simType}>
          {SIM_TYPES.map((s) => (
            <option key={s} value={s}>
              {SIM_TYPE_LABELS[s]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="생성일(KST) 부터">
        <input type="date" name="from" defaultValue={query.fromDate} className={`${CONTROL} px-3`} />
      </Field>
      <Field label="까지">
        <input type="date" name="to" defaultValue={query.toDate} className={`${CONTROL} px-3`} />
      </Field>
      <Field label="페이지 크기">
        <SelectBox name="size" defaultValue={String(query.size)}>
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}건
            </option>
          ))}
        </SelectBox>
      </Field>
      <div className="flex gap-2">
        <button type="submit" className="h-9 rounded-lg bg-brand px-4 text-[14px] font-bold text-fg-inverted">
          검색
        </button>
        <Link href="/admin/orders" className="flex h-9 items-center rounded-lg bg-weak px-4 text-[14px] text-fg">
          초기화
        </Link>
      </div>
    </form>
  );
}

const CONTROL = 'h-9 rounded-lg border border-line bg-layer text-[14px] text-fg';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1 text-xs text-fg-muted">
      {label}
      {children}
    </label>
  );
}

function Select({ name, value, children }: { name: string; value: string | undefined; children: ReactNode }) {
  return (
    <SelectBox name={name} defaultValue={value ?? ''}>
      <option value="">전체</option>
      {children}
    </SelectBox>
  );
}

/**
 * Native <select> without the browser's own arrow (its position cannot be styled and sat at the far
 * right edge), with our chevron a fixed 10px from the edge and room reserved for it.
 */
function SelectBox({ name, defaultValue, children }: { name: string; defaultValue: string; children: ReactNode }) {
  return (
    <span className="relative inline-flex">
      <select name={name} defaultValue={defaultValue} className={`${CONTROL} appearance-none pr-8 pl-3`}>
        {children}
      </select>
      <ChevronDownIcon aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-fg-muted" />
    </span>
  );
}
