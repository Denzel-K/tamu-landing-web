import React from "react";

interface TabNavigationWebProps<T extends string> {
  tabs: readonly T[];
  activeTab: T;
  onChange: (tab: T) => void;
}

export default function TabNavigationWeb<T extends string>({ tabs, activeTab, onChange }: TabNavigationWebProps<T>) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 bg-muted/40 rounded-xl p-1 border border-border">
        {tabs.map((t) => {
          const active = t === activeTab;
          return (
            <button
              key={t}
              onClick={() => onChange(t)}
              className={`${active ? 'bg-primary text-white' : 'bg-transparent text-foreground'} px-4 py-2 rounded-lg text-sm font-semibold`}
              aria-current={active ? 'page' : undefined}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
