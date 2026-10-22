'use server';

import { refresh } from 'next/cache';

import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { getUserId } from '@/lib/auth/session';
import { formatApiError } from '@/lib/format/errors';

import { iccidError, normalizeIccid } from './iccid';

export type RevealState = { activationCode: string } | { error: string } | null;

/**
 * Opens the eSIM activation code (assignment §2.3-④: "QR 확인" is the one install stage our own
 * service records). Records qr-viewed first, then reads the code, so the code reaches the browser
 * only after the view is on record; until the button is pressed the page never sends it.
 * qr-viewed is safe to repeat (the backend keeps the furthest stage). The page is refreshed so the
 * install status shows "QR 확인함".
 */
export async function revealActivationCodeAction(_prev: RevealState, formData: FormData): Promise<RevealState> {
  const orderNo = String(formData.get('orderNo') ?? '');
  try {
    const userId = await getUserId();
    await api.markQrViewed(userId, orderNo);
    const detail = await api.getMySim(userId, orderNo);
    const activationCode = detail?.sim?.activationCode;
    if (!activationCode) return { error: formatApiError('SIM_NOT_FOUND') };
    refresh();
    return { activationCode };
  } catch (error) {
    if (error instanceof ApiError) return { error: formatApiError(error.code) };
    throw error;
  }
}

export type RegisterState = { error: string | null };

/**
 * Registers the ICCID of a USIM picked up at the airport (assignment §2.3-② 유심). The format is
 * checked here too (same rule as the form and the backend). On success the backend also asks the
 * supplier to activate it; the page is refreshed to show the issued SIM. A 409 also refreshes, since
 * the order moved on (registered meanwhile).
 */
export async function registerIccidAction(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const orderNo = String(formData.get('orderNo') ?? '');
  const iccid = normalizeIccid(String(formData.get('iccid') ?? ''));
  const invalid = iccidError(iccid);
  if (invalid) return { error: invalid };

  try {
    await api.registerUsimIccid(await getUserId(), orderNo, iccid);
    refresh();
    return { error: null };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 409) refresh();
    return { error: formatApiError(error.code) };
  }
}

export type DemoStepState = { error: string | null };

/**
 * Demo: imitates installing the eSIM on a device or activating it abroad by changing the mock
 * supplier's profile (docs/decisions.md #48). The backend applies the supplier's answer through the
 * same path as its polling, so the page is refreshed to show the new install status and, after
 * activation, the remaining time. A 409 also refreshes (the SIM moved on meanwhile).
 */
export async function demoSimStepAction(_prev: DemoStepState, formData: FormData): Promise<DemoStepState> {
  const orderNo = String(formData.get('orderNo') ?? '');
  const step = formData.get('step') === 'activate' ? 'activate' : 'install';
  try {
    await api.demoSimStep(await getUserId(), orderNo, step);
    refresh();
    return { error: null };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 409) refresh();
    return { error: formatApiError(error.code) };
  }
}

export type PickupCardState = { iccid: string } | { error: string };

/**
 * Demo: stands in for picking up the USIM at the airport. Returns the card number the mock supplier
 * hands out for this order (same number on every call); the form fills it in and the user still
 * presses "ICCID 등록" (docs/decisions.md #48).
 */
export async function pickupCardAction(orderNo: string): Promise<PickupCardState> {
  try {
    const card = await api.demoPickupCard(await getUserId(), orderNo);
    return { iccid: card.iccid };
  } catch (error) {
    if (error instanceof ApiError) return { error: formatApiError(error.code) };
    throw error;
  }
}
