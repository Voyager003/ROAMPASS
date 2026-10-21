import type { Instant, KstDateTime, LocalDate } from '@/lib/api/types';

/**
 * KST display helpers. The backend sends UTC instants; the hosting runtime is UTC (Vercel) while
 * the operating standard is KST, so every formatter pins the time zone explicitly instead of
 * relying on the process default (docs/decisions.md #8). Pure functions: "now" is always passed in.
 */
export const KST_TIME_ZONE = 'Asia/Seoul';

const dateTimeFormat = new Intl.DateTimeFormat('ko-KR', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

// en-CA renders as YYYY-MM-DD, which is the backend's LocalDate format.
const isoDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: KST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function parts(instant: Instant) {
  const map = Object.fromEntries(
    dateTimeFormat.formatToParts(new Date(instant)).map((p) => [p.type, p.value]),
  );
  return { year: map.year, month: map.month, day: map.day, hour: map.hour, minute: map.minute };
}

/** "2026.05.02 00:20" (KST). */
export function formatKstDateTime(instant: Instant): string {
  const p = parts(instant);
  return `${p.year}.${p.month}.${p.day} ${p.hour}:${p.minute}`;
}

/** "2026.05.02" (KST calendar date of an instant). */
export function formatKstDate(instant: Instant): string {
  const p = parts(instant);
  return `${p.year}.${p.month}.${p.day}`;
}

/** KST calendar date of an instant as "YYYY-MM-DD" (for comparisons and form values). */
export function kstDateOf(instant: Instant | Date): LocalDate {
  return isoDateFormat.format(typeof instant === 'string' ? new Date(instant) : instant);
}

/**
 * "2026-05-02" → "2026.05.02". A LocalDate is already a KST calendar date, so it is
 * reformatted as text and never converted through a time zone.
 */
export function formatLocalDate(date: LocalDate): string {
  return date.replaceAll('-', '.');
}

/**
 * Backend `expiresAtKst` ("2026-05-09T00:20:00", already KST, no zone) → "2026.05.09 00:20".
 * Shown as given: converting it through Date would re-apply the runtime's time zone.
 */
export function formatKstLocalDateTime(value: KstDateTime): string {
  const [date, time = ''] = value.split('T');
  return `${date.replaceAll('-', '.')} ${time.slice(0, 5)}`.trim();
}

/**
 * Remaining time until `expiresAt`, coarse enough for a SIM card: "3일 4시간 남음", "2시간 10분 남음",
 * "5분 남음", "1분 미만 남음", or "만료됨" once passed.
 */
export function formatRemaining(expiresAt: Instant, now: Date): string {
  const ms = Date.parse(expiresAt) - now.getTime();
  if (ms <= 0) return '만료됨';
  const totalMinutes = Math.floor(ms / 60_000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}일 ${hours}시간 남음`;
  if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
  if (minutes > 0) return `${minutes}분 남음`;
  return '1분 미만 남음';
}

/** Age of data read at `asOf`, for admin screens (docs/decisions.md #7): "3초 전", "2분 전", "1시간 전". */
export function formatAge(asOf: Instant, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - Date.parse(asOf)) / 1000));
  if (seconds < 60) return `${seconds}초 전`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  return `${Math.floor(minutes / 60)}시간 전`;
}
