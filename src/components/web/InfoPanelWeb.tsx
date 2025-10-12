import React, { useEffect, useState } from "react";
import { fetchPaymentMethodsForRestaurant, type PaymentMethodsResponse } from "@/lib/api/payments";

interface Props {
  restaurant: {
    id: string;
    description?: string;
    operatingHours?: Record<string, string>;
    contact?: { phone?: string; whatsapp?: string; email?: string; instagram?: string };
    availableReservationTypes?: string[];
    reservationCapacity?: Record<string, { min?: number; max?: number }>;
    deliveryZones?: string[];
    loyaltyProgram?: { rewards?: string[] };
    socialLinks?: Array<{ platform: string; url: string }>;
  };
}

export default function InfoPanelWeb({ restaurant }: Props) {
  const [payments, setPayments] = useState<PaymentMethodsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!restaurant?.id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPaymentMethodsForRestaurant(restaurant.id);
        if (mounted) setPayments(data);
      } catch {
        if (mounted) setError("Failed to load payment methods");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [restaurant?.id]);

  const enabled = payments?.enabled || { mpesa: true, card: false, cash: true };
  const providers = payments?.providers || {};

  return (
    <div className="space-y-6">
      {restaurant.description && (
        <section>
          <h3 className="text-lg font-bold mb-2">About</h3>
          <p className="text-sm text-muted-foreground">{restaurant.description}</p>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold mb-2">Payments</h3>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading payment methods…</p>
        ) : error ? (
          <p className="text-sm text-muted-foreground">Payment methods unavailable.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1.5 rounded-full border ${enabled.mpesa ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-600' : 'bg-muted/60 border-border text-muted-foreground'}`}>M‑Pesa</span>
              <span className={`px-3 py-1.5 rounded-full border ${enabled.card ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600' : 'bg-muted/60 border-border text-muted-foreground'}`}>Card</span>
              <span className={`px-3 py-1.5 rounded-full border ${enabled.cash ? 'bg-amber-500/10 border-amber-500/40 text-amber-600' : 'bg-muted/60 border-border text-muted-foreground'}`}>Cash</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {enabled.mpesa ? (
                <div>M‑Pesa via {providers.mpesa || 'provider configured'}.</div>
              ) : (
                <div>M‑Pesa not accepted at this restaurant.</div>
              )}
              {enabled.card && (
                <div>Card payments via {providers.card || 'provider configured'}.</div>
              )}
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2">Operating Hours</h3>
        {restaurant.operatingHours && Object.keys(restaurant.operatingHours).length > 0 ? (
          <ul className="text-sm text-muted-foreground space-y-1">
            {Object.entries(restaurant.operatingHours).map(([day, hours]) => (
              <li key={day}>{day}: {hours || 'Closed'}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No operating hours provided.</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2">Contact</h3>
        {restaurant.contact?.phone || restaurant.contact?.whatsapp || restaurant.contact?.email || restaurant.contact?.instagram ? (
          <ul className="text-sm text-muted-foreground space-y-1">
            {restaurant.contact?.phone && <li>Phone: {restaurant.contact.phone}</li>}
            {restaurant.contact?.whatsapp && <li>WhatsApp: {restaurant.contact.whatsapp}</li>}
            {restaurant.contact?.email && <li>Email: {restaurant.contact.email}</li>}
            {restaurant.contact?.instagram && <li>Instagram: {restaurant.contact.instagram}</li>}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No contact or social media information.</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2">Reservation Capacity</h3>
        {restaurant.availableReservationTypes && restaurant.availableReservationTypes.length > 0 ? (
          <ul className="text-sm text-muted-foreground space-y-1">
            {restaurant.availableReservationTypes.map((type) => (
              <li key={type}>{type.toUpperCase()}: {restaurant.reservationCapacity?.[type]?.min ?? '-'}–{restaurant.reservationCapacity?.[type]?.max ?? '-'} people</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Reservations not available.</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2">Delivery Zones</h3>
        {restaurant.deliveryZones && restaurant.deliveryZones.length > 0 ? (
          <p className="text-sm text-muted-foreground">{restaurant.deliveryZones.join(', ')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No delivery zones specified.</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2">Loyalty Program</h3>
        {restaurant.loyaltyProgram?.rewards?.length ? (
          <ul className="text-sm text-muted-foreground space-y-1">
            {restaurant.loyaltyProgram.rewards.map((r) => (<li key={r}>• {r}</li>))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No loyalty program available.</p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2">Social Links</h3>
        {restaurant.socialLinks?.length ? (
          <div className="flex flex-wrap gap-2">
            {restaurant.socialLinks.map((s, i) => (
              <a key={`${s.platform}-${i}`} href={s.url} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-full border border-border hover:bg-muted text-sm">
                {s.platform}
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No social links provided.</p>
        )}
      </section>
    </div>
  );
}
