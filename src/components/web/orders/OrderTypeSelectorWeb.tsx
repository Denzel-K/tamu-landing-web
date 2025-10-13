import React from "react";
import type { OrderType } from "@/lib/api/orders";

interface Props {
  availableOrderTypes: string[];
  selectedOrderType: OrderType | "" | null | undefined;
  onSelectOrderType: (t: OrderType) => void;
}

const ALL: OrderType[] = ["dine-in", "takeaway", "delivery"];

export default function OrderTypeSelectorWeb({ availableOrderTypes, selectedOrderType, onSelectOrderType }: Props) {
  const set = new Set((availableOrderTypes || []).map(String));
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">Select order type</div>
      <div className="flex gap-2">
        {ALL.map((t) => {
          const enabled = set.size === 0 || set.has(t);
          const active = selectedOrderType === t;
          return (
            <button
              key={t}
              disabled={!enabled}
              onClick={() => enabled && onSelectOrderType(t)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold ${active ? 'bg-primary text-white border-primary' : 'bg-card text-foreground border-border'} ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-pressed={active}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
