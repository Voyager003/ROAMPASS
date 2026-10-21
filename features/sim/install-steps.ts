import { INSTALL_STATUSES, type InstallStatus } from '@/lib/api/types';

/**
 * The five install stages of an issued SIM (assignment §2.3-④), in order. The status never moves
 * backwards, so every stage up to the current one counts as reached.
 */
export type InstallStep = { status: InstallStatus; reached: boolean; current: boolean };

export function installSteps(current: InstallStatus): InstallStep[] {
  const index = INSTALL_STATUSES.indexOf(current);
  return INSTALL_STATUSES.map((status, i) => ({ status, reached: i <= index, current: i === index }));
}
