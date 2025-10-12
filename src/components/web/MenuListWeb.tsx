import React from "react";

type MenuItem = { id?: string; name: string; price: number; description?: string };
export interface MenuCategory { category: string; items?: MenuItem[] }

export default function MenuListWeb({ menu }: { menu?: MenuCategory[] }) {
  if (!menu || menu.length === 0) {
    return <p className="text-sm text-muted-foreground">Menu not available.</p>;
  }
  return (
    <div className="space-y-4">
      {menu.map((cat) => (
        <div key={cat.category}>
          <h3 className="text-sm font-semibold text-foreground/90 mb-2 tracking-tight">{cat.category}</h3>
          <ul className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {(cat.items || []).map((it) => (
              <li key={(cat.category || "") + (it.id || it.name)} className="flex items-start justify-between p-3 bg-card">
                <div className="pr-3">
                  <div className="font-medium text-foreground">{it.name}</div>
                  {it.description && (
                    <div className="text-xs text-muted-foreground mt-0.5">{it.description}</div>
                  )}
                </div>
                <div className="text-sm font-semibold">{it.price.toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
