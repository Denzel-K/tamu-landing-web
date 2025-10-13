import React from "react";

export interface ReservationSummaryLike {
  type?: string;
  partySize?: number;
  date?: string;
  time?: string;
  restaurant?: { name?: string } | null;
}

export default function ReservationSummaryWeb({ reservation }: { reservation: ReservationSummaryLike }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">Restaurant</div>
        <div className="font-semibold">{reservation.restaurant?.name || 'Restaurant'}</div>
      </div>
      <div className="grid sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-muted-foreground text-xs">Type</div>
          <div className="font-semibold">{String(reservation.type || 'table').toUpperCase()}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-muted-foreground text-xs">Party Size</div>
          <div className="font-semibold">{reservation.partySize || '-'}</div>
        </div>
        <div className="rounded-lg border border-border bg-background p-3">
          <div className="text-muted-foreground text-xs">Date & Time</div>
          <div className="font-semibold">{reservation.date || ''} {reservation.time || ''}</div>
        </div>
      </div>
    </div>
  );
}
