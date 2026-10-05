/**
 * Phone helpers. Numbers are stored in one canonical form (+234XXXXXXXXXX for Nigeria,
 * +<country><number> otherwise) so WhatsApp/call links always work.
 */
export function normalizePhone(input?: string | null): string | null {
  if (!input) return null;
  let s = String(input).trim().replace(/[\s\-().]/g, '');
  if (!s) return null;
  if (s.startsWith('00')) s = '+' + s.slice(2);

  if (s.startsWith('+')) {
    let digits = s.slice(1);
    if (!/^\d{8,15}$/.test(digits)) return null;
    if (digits.startsWith('2340') && digits.length === 14) digits = '234' + digits.slice(4); // +234 0803… typo
    if (digits.startsWith('234') && !/^234[789][01]\d{8}$/.test(digits)) return null; // invalid Nigerian number
    return '+' + digits;
  }
  if (!/^\d+$/.test(s)) return null;
  if (/^0[789][01]\d{8}$/.test(s)) return '+234' + s.slice(1);
  if (/^[789][01]\d{8}$/.test(s)) return '+234' + s;
  if (/^234[789][01]\d{8}$/.test(s)) return '+' + s;
  return null;
}

export const isValidPhone = (v?: string | null): boolean => normalizePhone(v) !== null;

/** Digits only, e.g. 2348031234567 – the format wa.me needs. */
export const phoneDigits = (v?: string | null): string => (normalizePhone(v) || '').replace(/\D/g, '');

/** Friendly display: +2348031234567 -> 0803 123 4567 */
export function formatPhoneDisplay(v?: string | null): string {
  const n = normalizePhone(v);
  if (!n) return v || '';
  if (/^\+234\d{10}$/.test(n)) {
    const local = '0' + n.slice(4);
    return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
  }
  return n;
}
