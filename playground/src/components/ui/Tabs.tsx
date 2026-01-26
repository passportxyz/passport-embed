"use client";

import { useState, ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  group?: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className = "" }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const activeContent = tabs.find((tab) => tab.id === activeTab)?.content;

  // Group tabs by their group property
  const groupedTabs: { group: string | undefined; tabs: Tab[] }[] = [];
  let currentGroup: string | undefined = undefined;

  tabs.forEach((tab) => {
    if (tab.group !== currentGroup) {
      groupedTabs.push({ group: tab.group, tabs: [tab] });
      currentGroup = tab.group;
    } else {
      groupedTabs[groupedTabs.length - 1].tabs.push(tab);
    }
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex border-b border-border">
        {groupedTabs.map((group, groupIndex) => (
          <div key={groupIndex} className="flex items-center">
            {groupIndex > 0 && (
              <div className="w-px h-5 bg-border mx-2" />
            )}
            {group.tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-auto">{activeContent}</div>
    </div>
  );
}
