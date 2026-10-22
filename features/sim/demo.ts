import type { InstallStatus, OrderStatus, SimType } from '@/lib/api/types';

/**
 * Which demo buttons the My SIM screen shows (docs/decisions.md #48). The demo imitates what a real
 * device would do by changing the mock supplier's profile (assignment: "설치·개통은 모의 공급사의
 * 상태를 바꾸는 것으로 흉내 내면 됨"). Same rule as the backend `DemoSimService`, which decides in
 * the end (409 DEMO_NOT_APPLICABLE).
 *
 * - install: an issued eSIM not installed yet (ISSUED / QR_VIEWED)
 * - activate: an issued eSIM not activated yet (ISSUED / QR_VIEWED / INSTALLED), so a device that
 *   installs and activates in one go can skip the install button
 * Neither is shown for a refunded order or a SIM deleted from the device.
 */
export type DemoSimButtons = { install: boolean; activate: boolean };

const INSTALLABLE: readonly InstallStatus[] = ['ISSUED', 'QR_VIEWED'];
const ACTIVATABLE: readonly InstallStatus[] = ['ISSUED', 'QR_VIEWED', 'INSTALLED'];

export function demoSimButtons(input: {
  simType: SimType;
  orderStatus: OrderStatus;
  installStatus: InstallStatus;
  deleted: boolean;
}): DemoSimButtons {
  const open = input.simType === 'ESIM' && input.orderStatus === 'ISSUED' && !input.deleted;
  return {
    install: open && INSTALLABLE.includes(input.installStatus),
    activate: open && ACTIVATABLE.includes(input.installStatus),
  };
}
