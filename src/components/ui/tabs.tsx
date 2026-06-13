"use client";

import { ReactNode, useState } from "react";
import { clsx } from "clsx";

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: { id: string; label: string; content: ReactNode }[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id);

  return (
    <div>
      <div className="mb-4 flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={clsx(
              "rounded-t-lg px-4 py-2 text-sm font-medium transition-colors",
              active === tab.id
                ? "border-b-2 border-brand-600 text-brand-700"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.find((t) => t.id === active)?.content}
    </div>
  );
}
