"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown, Settings2 } from "lucide-react";

// Collapsible "Advanced" section for forms. Used to tuck away the optional
// manual position input so sort order stays system-managed by default.

export function AdvancedSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
      >
        <span className="flex items-center gap-2">
          <Settings2 className="w-4 h-4" />
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 py-3 border-t border-border space-y-3">{children}</div>}
    </div>
  );
}

// Manual position field. Empty means "keep / append". Stored as a string so
// the input can be cleared; the API coerces it via positionValue.
export function PositionField({
  value,
  onChange,
  label,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  hint: string;
}) {
  return (
    <div>
      <label className="block text-sm text-foreground-secondary mb-1">{label}</label>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-gold-500"
      />
      <p className="mt-1 text-xs text-foreground-secondary">{hint}</p>
    </div>
  );
}
