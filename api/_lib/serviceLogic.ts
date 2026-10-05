// Pure logic for service requests (quote → escrow → delivery → release). Unit-tested.
import { cleanText } from './orderLogic.js';

export type ServiceReqStatus =
  | 'requested' | 'quoted' | 'in_progress' | 'ready_for_review' | 'completed'
  | 'declined' | 'disputed' | 'cancelled' | 'refunded' | 'accepted' | 'revision_requested';

export type ServiceAction = 'quote' | 'decline' | 'deliver' | 'approve' | 'dispute' | 'admin_refund' | 'admin_release';

export const MIN_SERVICE_PRICE = 100;
export const MAX_SERVICE_PRICE = 5_000_000;

const isUuid = (v: unknown): v is string => typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v);
export { isUuid };

export function validateNewRequest(b: any): { ok: boolean; error?: string; value?: { serviceId: string; description: string; budget: number; deadlineDate: string; referenceImages: string[] } } {
  if (!isUuid(b?.serviceId)) return { ok: false, error: 'This service is out of date. Please refresh and try again.' };
  const description = cleanText(b?.description, 2000);
  if (description.length < 15) return { ok: false, error: 'Please describe what you need (at least 15 characters).' };
  const budget = Math.round(Number(b?.budget));
  if (!Number.isFinite(budget) || budget < MIN_SERVICE_PRICE || budget > MAX_SERVICE_PRICE) return { ok: false, error: 'Enter a realistic budget between ₦100 and ₦5,000,000.' };
  const deadlineDate = /^\d{4}-\d{2}-\d{2}$/.test(String(b?.deadlineDate || '')) ? String(b.deadlineDate) : '';
  const referenceImages = Array.isArray(b?.referenceImages) ? b.referenceImages.filter((u: any) => /^https:\/\//.test(String(u))).slice(0, 5).map((u: string) => u.slice(0, 600)) : [];
  return { ok: true, value: { serviceId: b.serviceId, description, budget, deadlineDate, referenceImages } };
}

export function validateQuote(b: any): { ok: boolean; error?: string; value?: { amount: number; days: number; terms: string } } {
  const amount = Math.round(Number(b?.quoteAmount));
  if (!Number.isFinite(amount) || amount < MIN_SERVICE_PRICE || amount > MAX_SERVICE_PRICE) return { ok: false, error: 'Quote must be between ₦100 and ₦5,000,000.' };
  const days = Math.round(Number(b?.quoteDeliveryDays));
  if (!Number.isFinite(days) || days < 1 || days > 90) return { ok: false, error: 'Delivery time must be 1 to 90 days.' };
  return { ok: true, value: { amount, days, terms: cleanText(b?.quoteTerms, 1000) } };
}

export function validateDelivery(b: any): { ok: boolean; error?: string; value?: { notes: string; urls: string[] } } {
  const notes = cleanText(b?.deliveryNotes, 2000);
  if (!notes) return { ok: false, error: 'Please describe the delivered work.' };
  const urls = Array.isArray(b?.deliveryUrls) ? b.deliveryUrls.map((u: any) => String(u).trim()).filter((u: string) => /^https?:\/\/[^\s]{3,}$/i.test(u)).slice(0, 5).map((u: string) => u.slice(0, 600)) : [];
  return { ok: true, value: { notes, urls } };
}

export function nextServiceState(
  req: { status: ServiceReqStatus; client_id: string; provider_id: string },
  action: ServiceAction,
  actor: { id: string; isAdmin: boolean }
): { ok: boolean; status?: ServiceReqStatus; error?: string; code?: number } {
  const isClient = actor.id === req.client_id;
  const isProvider = actor.id === req.provider_id;
  const deny = (error: string, code = 403) => ({ ok: false, error, code });
  const s = req.status;
  switch (action) {
    case 'quote':
      if (!isProvider) return deny('Only the provider can send a quote.');
      if (s !== 'requested' && s !== 'quoted') return deny(`Cannot quote while request is ${s}.`, 409);
      return { ok: true, status: 'quoted' as ServiceReqStatus };
    case 'decline':
      if (!isProvider && !isClient) return deny('Not your request.');
      if (s !== 'requested' && s !== 'quoted') return deny('Only unpaid requests can be declined.', 409);
      return { ok: true, status: 'declined' as ServiceReqStatus };
    case 'deliver':
      if (!isProvider) return deny('Only the provider can submit work.');
      if (s !== 'in_progress' && s !== 'revision_requested') return deny(`Cannot deliver while request is ${s}.`, 409);
      return { ok: true, status: 'ready_for_review' as ServiceReqStatus };
    case 'approve':
      if (!isClient) return deny('Only the client can release payment.');
      if (s !== 'ready_for_review') return deny('Work must be delivered before payment is released.', 409);
      return { ok: true, status: 'completed' as ServiceReqStatus };
    case 'dispute':
      if (!isProvider && !isClient) return deny('Not your request.');
      if (s !== 'in_progress' && s !== 'ready_for_review') return deny('Only paid, active jobs can be disputed.', 409);
      return { ok: true, status: 'disputed' as ServiceReqStatus };
    case 'admin_refund':
      if (!actor.isAdmin) return deny('Admin only.');
      if (s !== 'disputed') return deny('Only disputed jobs can be refunded.', 409);
      return { ok: true, status: 'refunded' as ServiceReqStatus };
    case 'admin_release':
      if (!actor.isAdmin) return deny('Admin only.');
      if (s !== 'disputed') return deny('Only disputed jobs can be released.', 409);
      return { ok: true, status: 'completed' as ServiceReqStatus };
    default:
      return deny('Unknown action.', 400);
  }
}
