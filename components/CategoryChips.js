"use client";
import * as Icons from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryChips({ active, onChange }) {
  return (
    <div className="chips-scroll flex gap-2 overflow-x-auto px-4 py-2 -mx-4">
      <Chip label="Tout" selected={!active} onClick={() => onChange(null)} />
      {CATEGORIES.map((c) => {
        const Icon = Icons[c.icon];
        return (
          <Chip
            key={c.id}
            label={c.label}
            icon={Icon}
            selected={active === c.id}
            onClick={() => onChange(c.id)}
          />
        );
      })}
    </div>
  );
}

function Chip({ label, icon: Icon, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] border transition-colors ${
        selected
          ? "bg-moss-dark text-white border-moss-dark"
          : "bg-white text-ink border-[#E7E1D2]"
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );
}
