import React from "react";

interface Props {
  valueDate: string;
  valueTime: string;
  onChangeDate: (v: string) => void;
  onChangeTime: (v: string) => void;
}

export default function DateTimeFieldWeb({ valueDate, valueTime, onChangeDate, onChangeTime }: Props) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <div className="text-sm text-muted-foreground">Date</div>
        <input
          type="date"
          value={valueDate}
          onChange={(e) => onChangeDate(e.target.value)}
          className="w-full rounded-md border border-border bg-input px-3 py-2"
        />
      </div>
      <div className="space-y-1.5">
        <div className="text-sm text-muted-foreground">Time</div>
        <input
          type="time"
          value={valueTime}
          onChange={(e) => onChangeTime(e.target.value)}
          className="w-full rounded-md border border-border bg-input px-3 py-2"
        />
      </div>
    </div>
  );
}
