'use client';

import { ActionButton } from '@seed-design/react';
import { useActionState, useState } from 'react';

import type { OrderNo } from '@/lib/api/types';

import type { RevealState } from '../actions';
import { splitActivationCode } from '../activation-code';

/**
 * "설치 코드 보기": the code stays hidden until pressed (the press is what the backend records as
 * QR_VIEWED). Shown as text with copy buttons, no QR image (docs/decisions.md #44).
 */
export function ActivationCodeReveal({
  orderNo,
  revealAction,
}: {
  orderNo: OrderNo;
  revealAction: (state: RevealState, formData: FormData) => Promise<RevealState>;
}) {
  const [state, formAction, pending] = useActionState(revealAction, null);

  if (state && 'activationCode' in state) {
    const parts = splitActivationCode(state.activationCode);
    return (
      <div className="grid gap-3">
        <p className="text-[14px] text-fg">
          기기의 eSIM 추가 메뉴에서 수동 입력을 고르고 아래 정보를 입력하세요. 설치하는 동안 기기가 인터넷에 연결돼 있어야 해요.
        </p>
        {parts ? (
          <>
            <CodeRow label="SM-DP+ 주소" value={parts.smdpAddress} />
            <CodeRow label="활성화 코드" value={parts.matchingId} />
          </>
        ) : null}
        <CodeRow label="전체 코드" value={state.activationCode} />
        <p className="text-[13px] text-fg-muted">설치하면 환불할 수 없어요.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="orderNo" value={orderNo} />
      <p className="text-[14px] text-fg-muted">코드를 열면 &lsquo;QR 확인함&rsquo;으로 기록돼요. 설치나 개통 전이면 여전히 환불할 수 있어요.</p>
      <ActionButton type="submit" size="large" loading={pending} disabled={pending}>
        설치 코드 보기
      </ActionButton>
      {state && 'error' in state && (
        <p role="alert" className="text-[13px] text-fg-critical">
          {state.error}
        </p>
      )}
    </form>
  );
}

function CodeRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-weak px-3 py-2">
      <div className="min-w-0">
        <p className="text-[12px] text-fg-muted">{label}</p>
        <p className="font-mono text-[14px] break-all text-fg">{value}</p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-full border border-line px-3 py-1 text-[12px] text-fg"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? '복사됨' : '복사'}
      </button>
    </div>
  );
}
