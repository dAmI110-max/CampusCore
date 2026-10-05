import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { StorageService } from './storageService';
import { Product, Accommodation, Order, OrderStatus, ServiceListing, ServiceRequest, Booking } from '../types';

type Result<T> = { success: boolean; data?: T; message?: string };

const FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

/** Server-backed marketplace data (listings, hostels, orders, Paystack). The browser cache is only a mirror of this. */
export class MarketService {
  static get enabled(): boolean {
    return isSupabaseConfigured();
  }

  private static async session() {
    const client = getSupabase();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data?.session || null;
  }

  private static friendly(msg?: string): string {
    const m = (msg || '').toLowerCase();
    if (m.includes('row-level security') || m.includes('permission denied'))
      return 'You are not allowed to do that. Complete seller onboarding (or log in again) and retry.';
    if (m.includes('failed to fetch') || m.includes('network')) return 'Network problem. Check your connection and try again.';
    return msg || 'Something went wrong. Please try again.';
  }

  // ---------------- mappers ----------------
  static mapListing(d: any): Product {
    return {
      id: d.id, sellerId: d.seller_id, sellerName: d.seller_name, sellerAvatar: d.seller_avatar || FALLBACK_AVATAR,
      sellerCampus: d.seller_campus || 'Osogbo Main Campus', sellerWhatsapp: d.seller_whatsapp, sellerPhone: d.seller_phone,
      sellerRating: 5, categoryId: d.category_id, categoryName: d.category_name, title: d.title, slug: d.slug,
      description: d.description, price: Number(d.price), originalPrice: d.original_price ? Number(d.original_price) : undefined,
      currency: 'NGN', condition: d.condition, tradeMode: 'both', location: d.seller_campus || 'UNIOSUN Campus',
      campusId: d.campus_id, universityId: 'uni-uniosun', images: Array.isArray(d.images) ? d.images : [],
      status: d.status, views: d.views_count || 0, viewsCount: d.views_count || 0, favoritesCount: d.favorites_count || 0,
      negotiable: !!d.negotiable, deliveryAvailable: !!d.delivery_available, featured: false,
      createdAt: d.created_at, updatedAt: d.updated_at,
    };
  }

  static mapAccommodation(d: any): Accommodation {
    return {
      id: d.id, ownerId: d.owner_id, ownerName: d.owner_name, ownerAvatar: d.owner_avatar || FALLBACK_AVATAR,
      ownerPhone: d.owner_phone || '', ownerWhatsapp: d.owner_whatsapp || '', ownerVerified: !!d.verified_lodge,
      title: d.title, description: d.description, location: d.location, distanceToCampus: d.distance_to_campus || '',
      campusId: d.campus_id, universityId: 'uni-uniosun', price: Number(d.price), currency: 'NGN',
      rentalPeriod: d.rental_period, roomType: d.room_type, available: !!d.available, verifiedLodge: !!d.verified_lodge,
      images: Array.isArray(d.images) ? d.images : [], amenities: Array.isArray(d.amenities) ? d.amenities : [],
      status: d.status, featured: !!d.featured, createdAt: d.created_at, updatedAt: d.updated_at,
    };
  }

  static mapOrder(d: any): Order {
    const statusMap: Record<string, OrderStatus> = {
      pending_payment: 'payment_pending', escrow_funded: 'seller_processing', item_dispatched: 'delivered',
      item_delivered: 'delivered', completed: 'completed', disputed: 'disputed', cancelled: 'cancelled', refunded: 'refunded',
    };
    return {
      id: d.id, orderNumber: d.order_number, buyerId: d.buyer_id, buyerName: d.buyer_name, buyerAvatar: d.buyer_avatar || FALLBACK_AVATAR,
      buyerCampus: d.buyer_campus || '', sellerId: d.seller_id, sellerName: d.seller_name, sellerAvatar: d.seller_avatar || FALLBACK_AVATAR,
      sellerCampus: d.seller_campus || '', productId: d.listing_id || '', productTitle: d.listing_title, productImage: d.listing_image || '',
      amount: Number(d.amount), platformFee: Number(d.platform_fee || 0), sellerReceives: Number(d.seller_receives || 0), currency: 'NGN',
      status: statusMap[d.status] || 'created', deliveryCampus: d.delivery_campus || '', deliveryLocation: d.delivery_location || d.pickup_location || '',
      deliveryNotes: d.delivery_notes || undefined,
      escrowStatus: (d.escrow_status as any) || 'held', createdAt: d.created_at, updatedAt: d.updated_at, completedAt: d.completed_at || undefined,
    };
  }

  static mapService(d: any): ServiceListing {
    return {
      id: d.id, providerId: d.provider_id, providerName: d.provider_name, providerAvatar: d.provider_avatar || FALLBACK_AVATAR,
      providerCampus: d.provider_campus || '', providerUniversity: d.provider_university || 'Osun State University',
      providerRating: 5, providerReviewCount: 0, providerCompletedJobs: 0, providerVerification: d.provider_verification || 'unverified',
      providerPhone: d.provider_phone || undefined, providerWhatsapp: d.provider_whatsapp || undefined,
      categoryId: d.category_id, categoryName: d.category_name, title: d.title, slug: d.slug || '', description: d.description,
      startingPrice: Number(d.starting_price), pricingModel: d.pricing_model, deliveryMethod: d.delivery_method,
      estimatedDeliveryDays: d.estimated_delivery_days || 2, turnaroundTime: d.turnaround_time || undefined,
      packages: Array.isArray(d.packages) ? d.packages : undefined, location: d.location || '', campusId: d.campus_id,
      universityId: d.university_id || 'uni-uniosun', portfolioImages: Array.isArray(d.portfolio_images) ? d.portfolio_images : [],
      features: Array.isArray(d.features) ? d.features : [], status: d.status, views: d.views || 0, featured: !!d.featured,
      createdAt: d.created_at, updatedAt: d.updated_at,
    };
  }

  static mapServiceRequest(d: any): ServiceRequest {
    return {
      id: d.id, requestNumber: d.request_number, serviceId: d.service_id || '', serviceTitle: d.service_title,
      clientId: d.client_id, clientName: d.client_name, clientAvatar: d.client_avatar || FALLBACK_AVATAR, clientCampus: d.client_campus || '',
      providerId: d.provider_id, providerName: d.provider_name, providerAvatar: d.provider_avatar || FALLBACK_AVATAR,
      description: d.description, referenceImages: d.reference_images || [], budget: Number(d.budget),
      deadlineDate: d.deadline_date || '', deadline: d.deadline_date || undefined, status: d.status,
      quoteAmount: d.quote_amount != null ? Number(d.quote_amount) : undefined, quoteDeliveryDays: d.quote_delivery_days || undefined,
      quoteTerms: d.quote_terms || undefined, escrowOrderId: d.payment_reference && d.paid_at ? d.payment_reference : undefined,
      revisionsUsed: d.revisions_used || 0, maxRevisions: d.max_revisions || 2, deliveryWorkUrls: d.delivery_work_urls || [],
      deliveryNotes: d.delivery_notes || undefined, createdAt: d.created_at, updatedAt: d.updated_at, completedAt: d.completed_at || undefined,
    } as ServiceRequest;
  }

  static mapBooking(d: any): Booking {
    return {
      id: d.id, bookingNumber: d.booking_number, serviceId: d.service_id || undefined, serviceTitle: d.service_title,
      providerId: d.provider_id, providerName: d.provider_name, providerAvatar: d.provider_avatar || FALLBACK_AVATAR,
      customerId: d.customer_id, customerName: d.customer_name, customerAvatar: d.customer_avatar || FALLBACK_AVATAR,
      customerPhone: d.customer_phone || undefined, campusId: d.campus_id || '', locationVenue: d.location_venue || '',
      location: d.location_venue || '', date: d.date, timeSlot: d.time_slot, durationMinutes: d.duration_minutes || 60,
      price: Number(d.price), totalAmount: Number(d.total_amount), currency: d.currency || 'NGN', status: d.status,
      notes: d.notes || undefined, createdAt: d.created_at, updatedAt: d.updated_at,
    };
  }

  // ---------------- listings ----------------
  static async fetchListings(): Promise<Result<Product[]>> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'not configured' };
    const { data, error } = await client.from('listings').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return { success: false, message: this.friendly(error.message) };
    return { success: true, data: (data || []).map((d) => this.mapListing(d)) };
  }

  static async createListing(p: Partial<Product>): Promise<Result<Product>> {
    const client = getSupabase();
    const sess = await this.session();
    if (!client || !sess) return { success: false, message: 'Your session has expired. Please log in again.' };
    const { data, error } = await client.from('listings').insert({
      seller_id: sess.user.id, seller_name: p.sellerName, seller_avatar: p.sellerAvatar, seller_campus: p.sellerCampus,
      seller_phone: p.sellerPhone, seller_whatsapp: p.sellerWhatsapp, category_id: p.categoryId, category_name: p.categoryName || 'Others',
      title: p.title, slug: p.slug, description: p.description, price: p.price, condition: p.condition || 'Used',
      campus_id: p.campusId || 'campus-osogbo', images: p.images || [], status: 'active',
    }).select().single();
    if (error || !data) return { success: false, message: this.friendly(error?.message) };
    return { success: true, data: this.mapListing(data) };
  }

  static async updateListing(id: string, u: Partial<Product>): Promise<Result<Product>> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'not configured' };
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (u.title !== undefined) patch.title = u.title;
    if (u.description !== undefined) patch.description = u.description;
    if (u.price !== undefined) patch.price = u.price;
    if (u.condition !== undefined) patch.condition = u.condition;
    if (u.images !== undefined) patch.images = u.images;
    if (u.status !== undefined) patch.status = u.status;
    const { data, error } = await client.from('listings').update(patch).eq('id', id).select().maybeSingle();
    if (error) return { success: false, message: this.friendly(error.message) };
    if (!data) return { success: false, message: 'Listing not found or you do not own it.' };
    return { success: true, data: this.mapListing(data) };
  }

  static async deleteListing(id: string): Promise<Result<null>> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'not configured' };
    const { data, error } = await client.from('listings').delete().eq('id', id).select('id');
    if (error) return { success: false, message: this.friendly(error.message) };
    if (!data || data.length === 0) return { success: false, message: 'Listing not found or you do not own it.' };
    return { success: true };
  }

  // ---------------- accommodations (hostel agents) ----------------
  static async fetchAccommodations(): Promise<Result<Accommodation[]>> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'not configured' };
    const { data, error } = await client.from('accommodations').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return { success: false, message: this.friendly(error.message) };
    return { success: true, data: (data || []).map((d) => this.mapAccommodation(d)) };
  }

  static async createAccommodation(a: Partial<Accommodation>): Promise<Result<Accommodation>> {
    const client = getSupabase();
    const sess = await this.session();
    if (!client || !sess) return { success: false, message: 'Your session has expired. Please log in again.' };
    const { data, error } = await client.from('accommodations').insert({
      owner_id: sess.user.id, owner_name: a.ownerName, owner_avatar: a.ownerAvatar, owner_phone: a.ownerPhone, owner_whatsapp: a.ownerWhatsapp,
      title: a.title, description: a.description, location: a.location, distance_to_campus: a.distanceToCampus, campus_id: a.campusId,
      price: a.price, rental_period: a.rentalPeriod, room_type: a.roomType, available: true, images: a.images || [], amenities: a.amenities || [],
      status: 'active',
    }).select().single();
    if (error || !data) return { success: false, message: this.friendly(error?.message) };
    return { success: true, data: this.mapAccommodation(data) };
  }

  // ---------------- services ----------------
  static async fetchServices(): Promise<Result<ServiceListing[]>> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'not configured' };
    const { data, error } = await client.from('services').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return { success: false, message: this.friendly(error.message) };
    return { success: true, data: (data || []).map((d) => this.mapService(d)) };
  }

  static async createService(sv: Partial<ServiceListing>): Promise<Result<ServiceListing>> {
    const client = getSupabase();
    const sess = await this.session();
    if (!client || !sess) return { success: false, message: 'Your session has expired. Please log in again.' };
    const { data, error } = await client.from('services').insert({
      provider_id: sess.user.id, provider_name: sv.providerName, provider_avatar: sv.providerAvatar, provider_campus: sv.providerCampus,
      provider_university: sv.providerUniversity, provider_phone: sv.providerPhone, provider_whatsapp: sv.providerWhatsapp,
      category_id: sv.categoryId, category_name: sv.categoryName || 'General Service', title: sv.title, slug: sv.slug,
      description: sv.description, starting_price: sv.startingPrice, pricing_model: sv.pricingModel, delivery_method: sv.deliveryMethod,
      estimated_delivery_days: sv.estimatedDeliveryDays || 2, location: sv.location, campus_id: sv.campusId || 'campus-osogbo',
      university_id: sv.universityId, portfolio_images: sv.portfolioImages || [], features: sv.features || [], status: 'active',
    }).select().single();
    if (error || !data) return { success: false, message: this.friendly(error?.message) };
    return { success: true, data: this.mapService(data) };
  }

  static async updateService(id: string, u: Partial<ServiceListing>): Promise<Result<ServiceListing>> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'not configured' };
    const patch: Record<string, any> = { updated_at: new Date().toISOString() };
    if (u.title !== undefined) patch.title = u.title;
    if (u.description !== undefined) patch.description = u.description;
    if (u.startingPrice !== undefined) patch.starting_price = u.startingPrice;
    if (u.status !== undefined) patch.status = u.status;
    if (u.portfolioImages !== undefined) patch.portfolio_images = u.portfolioImages;
    const { data, error } = await client.from('services').update(patch).eq('id', id).select().maybeSingle();
    if (error) return { success: false, message: this.friendly(error.message) };
    if (!data) return { success: false, message: 'Service not found or you do not own it.' };
    return { success: true, data: this.mapService(data) };
  }

  static async deleteService(id: string): Promise<Result<null>> {
    const client = getSupabase();
    if (!client) return { success: false, message: 'not configured' };
    const { data, error } = await client.from('services').delete().eq('id', id).select('id');
    if (error) return { success: false, message: this.friendly(error.message) };
    if (!data || data.length === 0) return { success: false, message: 'Service not found or you do not own it.' };
    return { success: true };
  }

  // ---------------- service requests (server-enforced) ----------------
  static async fetchMyServiceRequests(): Promise<Result<ServiceRequest[]>> {
    const client = getSupabase();
    if (!client || !(await this.session())) return { success: false, message: 'not signed in' };
    const { data, error } = await client.from('service_requests').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) return { success: false, message: this.friendly(error.message) };
    return { success: true, data: (data || []).map((d) => this.mapServiceRequest(d)) };
  }

  static async createServiceRequest(p: { serviceId: string; description: string; budget: number; deadlineDate: string }): Promise<Result<null>> {
    const r = await this.api('/api/services/request', { method: 'POST', body: JSON.stringify({ action: 'create', ...p }) });
    if (!r.ok) return { success: false, message: r.body?.error || 'Could not send your request.' };
    await this.syncAll();
    return { success: true };
  }

  /** quote | decline | deliver | approve | dispute – the server checks who is allowed and what state the job is in. */
  static async serviceRequestAction(requestId: string, action: string, extra: Record<string, any> = {}): Promise<Result<null>> {
    const r = await this.api('/api/services/request', { method: 'POST', body: JSON.stringify({ action, requestId, ...extra }) });
    if (!r.ok) return { success: false, message: r.body?.error || 'Action failed.' };
    await this.syncAll();
    return { success: true };
  }

  /** Funds the escrow for a quoted job through Paystack. */
  static async startServiceCheckout(requestId: string): Promise<Result<{ url: string }>> {
    const r = await this.api('/api/payment/paystack/initialize', { method: 'POST', body: JSON.stringify({ kind: 'service_request', requestId }) });
    if (!r.ok || !r.body?.authorization_url) return { success: false, message: r.body?.error || 'Could not start payment.' };
    return { success: true, data: { url: r.body.authorization_url } };
  }

  // ---------------- bookings ----------------
  static async fetchMyBookings(): Promise<Result<Booking[]>> {
    const client = getSupabase();
    if (!client || !(await this.session())) return { success: false, message: 'not signed in' };
    const { data, error } = await client.from('service_bookings').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) return { success: false, message: this.friendly(error.message) };
    return { success: true, data: (data || []).map((d) => this.mapBooking(d)) };
  }

  static async createBooking(b: Partial<Booking>): Promise<Result<Booking>> {
    const client = getSupabase();
    const sess = await this.session();
    if (!client || !sess) return { success: false, message: 'Your session has expired. Please log in again.' };
    const price = Math.max(0, Number(b.price) || 0);
    const { data, error } = await client.from('service_bookings').insert({
      booking_number: `BOK-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      service_id: b.serviceId, service_title: b.serviceTitle, provider_id: b.providerId, provider_name: b.providerName, provider_avatar: b.providerAvatar,
      customer_id: sess.user.id, customer_name: b.customerName, customer_avatar: b.customerAvatar, customer_phone: b.customerPhone,
      campus_id: b.campusId, location_venue: b.locationVenue, date: b.date, time_slot: b.timeSlot, duration_minutes: b.durationMinutes || 60,
      price, total_amount: price, currency: 'NGN', status: 'confirmed', notes: b.notes,
    }).select().single();
    if (error || !data) {
      if (error?.code === '23505') return { success: false, message: 'That time slot was just taken. Please choose another time.' };
      return { success: false, message: this.friendly(error?.message) };
    }
    await this.syncAll();
    return { success: true, data: this.mapBooking(data) };
  }

  /** After a user edits their profile, refresh the contact snapshot stored on their existing listings/hostels. */
  static async syncSellerContact(userId: string, c: { name?: string; avatar?: string; phone?: string; whatsapp?: string }): Promise<void> {
    const client = getSupabase();
    if (!client) return;
    const l: Record<string, any> = {};
    const a: Record<string, any> = {};
    if (c.name) { l.seller_name = c.name; a.owner_name = c.name; }
    if (c.avatar) { l.seller_avatar = c.avatar; a.owner_avatar = c.avatar; }
    if (c.phone) { l.seller_phone = c.phone; a.owner_phone = c.phone; }
    if (c.whatsapp) { const d = c.whatsapp.replace(/\D/g, ''); l.seller_whatsapp = d; a.owner_whatsapp = d; }
    if (Object.keys(l).length === 0) return;
    try {
      await Promise.all([
        client.from('listings').update(l).eq('seller_id', userId),
        client.from('accommodations').update(a).eq('owner_id', userId),
      ]);
      await this.syncAll();
    } catch (e) {
      console.warn('syncSellerContact notice:', e);
    }
  }

  // ---------------- orders ----------------
  static async fetchMyOrders(): Promise<Result<Order[]>> {
    const client = getSupabase();
    const sess = await this.session();
    if (!client || !sess) return { success: false, message: 'not signed in' };
    const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) return { success: false, message: this.friendly(error.message) };
    return { success: true, data: (data || []).map((d) => this.mapOrder(d)) };
  }

  private static async api<T>(path: string, init: RequestInit): Promise<{ ok: boolean; status: number; body: any }> {
    const sess = await this.session();
    if (!sess) return { ok: false, status: 401, body: { error: 'Please log in again.' } };
    try {
      const res = await fetch(path, {
        ...init,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sess.access_token}`, ...(init.headers || {}) },
      });
      const body = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, body };
    } catch {
      return { ok: false, status: 0, body: { error: 'Network problem. Check your connection and try again.' } };
    }
  }

  /** Creates a server-priced order and returns the Paystack checkout URL. */
  static async startCheckout(listingId: string, delivery: { campus: string; location: string; notes?: string }): Promise<Result<{ url: string }>> {
    const r = await this.api('/api/payment/paystack/initialize', { method: 'POST', body: JSON.stringify({ listingId, delivery }) });
    if (!r.ok || !r.body?.authorization_url) return { success: false, message: r.body?.error || 'Could not start payment.' };
    return { success: true, data: { url: r.body.authorization_url } };
  }

  static async verifyPayment(reference: string): Promise<Result<{ verified: boolean; orderStatus?: string; kind?: string }>> {
    const r = await this.api(`/api/payment/paystack/verify/${encodeURIComponent(reference)}`, { method: 'GET' });
    if (!r.ok) return { success: false, message: r.body?.error || 'Could not verify payment.' };
    return { success: true, data: { verified: !!r.body.verified, orderStatus: r.body.orderStatus, kind: r.body.kind } };
  }

  static async orderAction(orderId: string, action: string, notes?: string): Promise<Result<null>> {
    const r = await this.api('/api/orders/action', { method: 'POST', body: JSON.stringify({ orderId, action, notes }) });
    if (!r.ok) return { success: false, message: r.body?.error || 'Action failed.' };
    await this.syncAll();
    return { success: true };
  }

  // ---------------- cache sync ----------------
  private static inFlight: Promise<void> | null = null;

  /** Pulls the truth from the server into the local mirror. Only overwrites a table if its fetch succeeded. */
  static syncAll(): Promise<void> {
    if (!this.enabled) return Promise.resolve();
    if (this.inFlight) return this.inFlight;
    this.inFlight = (async () => {
      const signedIn = !!(await this.session());
      const [l, a, sv, o, rq, bk] = await Promise.all([
        this.fetchListings(), this.fetchAccommodations(), this.fetchServices(),
        this.fetchMyOrders(), this.fetchMyServiceRequests(), this.fetchMyBookings(),
      ]);
      if (l.success && l.data) StorageService.replaceProductsFromServer(l.data);
      if (a.success && a.data) StorageService.replaceAccommodationsFromServer(a.data);
      if (sv.success && sv.data) StorageService.replaceServicesFromServer(sv.data);
      if (signedIn) {
        if (o.success && o.data) StorageService.replaceOrdersFromServer(o.data);
        if (rq.success && rq.data) StorageService.replaceServiceRequestsFromServer(rq.data);
        if (bk.success && bk.data) StorageService.replaceBookingsFromServer(bk.data);
      } else {
        // Signed out: never leave the previous person's private records in this browser (shared phones/PCs).
        StorageService.replaceOrdersFromServer([]);
        StorageService.replaceServiceRequestsFromServer([]);
        StorageService.replaceBookingsFromServer([]);
      }
    })().finally(() => { this.inFlight = null; });
    return this.inFlight;
  }

  static subscribe(onChange: () => void): () => void {
    const client = getSupabase();
    if (!client) return () => {};
    try {
      const ch = client.channel('cc_live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'accommodations' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, onChange)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings' }, onChange)
        .subscribe();
      return () => { client.removeChannel(ch); };
    } catch { return () => {}; }
  }
}
