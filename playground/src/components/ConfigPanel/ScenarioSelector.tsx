"use client";

import { Select } from "@/components/ui/Select";
import { PlaygroundConfig, scenarios } from "@/lib/default-config";

interface ScenarioSelectorProps {
  config: PlaygroundConfig;
  onChange: (updates: Partial<PlaygroundConfig>) => void;
}

export function ScenarioSelector({ config, onChange }: ScenarioSelectorProps) {
  const selectedScenario = scenarios.find((s) => s.value === config.scenario);

  return (
    <div>
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Test Scenario
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Connect the mock wallet in the Live Preview to see scenario results.
      </p>
      <div className="space-y-3">
        <Select
          options={scenarios.map((s) => ({
            value: s.value,
            label: s.label,
          }))}
          value={config.scenario}
          onChange={(e) => onChange({ scenario: e.target.value })}
        />
        {selectedScenario && (
          <p className="text-xs text-muted-foreground p-2.5 rounded-lg bg-muted border border-border">
            {selectedScenario.description}
          </p>
        )}
      </div>
    </div>
  );
}
