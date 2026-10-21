/**
 * eSIM activation codes follow the GSMA "LPA:1$<SM-DP+ address>$<matching ID>" form. Devices that
 * offer manual entry ask for the two parts separately, so the screen shows them apart when the code
 * has that form, and the raw code otherwise.
 */
export type ActivationCodeParts = { smdpAddress: string; matchingId: string };

export function splitActivationCode(code: string): ActivationCodeParts | null {
  const [prefix, smdpAddress, matchingId] = code.split('$');
  if (prefix !== 'LPA:1' || !smdpAddress || !matchingId) return null;
  return { smdpAddress, matchingId };
}
