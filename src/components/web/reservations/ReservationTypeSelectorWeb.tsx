import React from "react";

interface Props {
  availableReservationTypes: string[];
  selectedReservationType: string | undefined;
  onSelectReservationType: (t: "table" | "space") => void;
}

const ALL: Array<"table" | "space"> = ["table", "space"];

export default function ReservationTypeSelectorWeb({ availableReservationTypes, selectedReservationType, onSelectReservationType }: Props) {
  const set = new Set((availableReservationTypes || []).map(String));
  return (
    <div>
      <div className="mb-2 text-sm text-muted-foreground">Select reservation type</div>
      <div className="flex gap-2">
        {ALL.map((t) => {
          const enabled = set.size === 0 || set.has(t);
          const active = selectedReservationType === t;
          return (
            <button
              key={t}
              disabled={!enabled}
              onClick={() => enabled && onSelectReservationType(t)}
              className={`px-4 py-2 rounded-xl border text-sm font-semibold ${active ? 'bg-accent text-foreground border-accent' : 'bg-card text-foreground border-border'} ${!enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
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
