import { Badge } from '@/components/ui/badge';
import { Table, Td, Th } from '@/components/ui/table';
import type { CallbackInfo } from '@/lib/api/types';
import { formatKstDateTime } from '@/lib/format/kst';
import { CALLBACK_OUTCOME_LABELS } from '@/lib/format/labels';

/** Received PG webhooks / supplier callbacks with signature check and processing result. */
export function CallbackTable({ callbacks }: { callbacks: CallbackInfo[] }) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>수신(KST)</Th>
          <Th>출처</Th>
          <Th>이벤트</Th>
          <Th>서명</Th>
          <Th>처리 결과</Th>
          <Th>메모</Th>
        </tr>
      </thead>
      <tbody>
        {callbacks.map((c, i) => (
          <tr key={`${c.receivedAt}-${i}`}>
            <Td>{formatKstDateTime(c.receivedAt)}</Td>
            <Td>{c.source === 'PG' ? 'PG' : '공급사'}</Td>
            <Td>{c.eventKey ?? '-'}</Td>
            <Td>{c.signatureOk ? '정상' : <span className="text-fg-critical">불일치</span>}</Td>
            <Td>
              <Badge tone={CALLBACK_OUTCOME_LABELS[c.outcome].tone}>{CALLBACK_OUTCOME_LABELS[c.outcome].label}</Badge>
            </Td>
            <Td className="whitespace-normal">{c.note ?? '-'}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
