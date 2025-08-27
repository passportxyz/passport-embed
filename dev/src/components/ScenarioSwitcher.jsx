import { useState } from 'react';
import { usePassportQueryClient } from '@passportxyz/passport-embed';
import { scenarioManager } from '../mocks/ScenarioManager';
import { scenarios } from '../mocks/scenarios';

export function ScenarioSwitcher() {
  const [currentScenario, setCurrentScenario] = useState(scenarioManager.current);
  const queryClient = usePassportQueryClient();

  const handleScenarioChange = (name) => {
    setCurrentScenario(name);
    scenarioManager.switchScenario(name);
    // Invalidate all queries to refetch with new scenario data
    queryClient.invalidateQueries();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ff6b00',
      borderRadius: '8px',
      padding: '10px',
      zIndex: 10000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '300px',
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '8px',
        color: '#ff6b00',
        fontSize: '12px',
      }}>
        🎭 MSW Scenario
      </div>
      <select
        value={currentScenario}
        onChange={(e) => handleScenarioChange(e.target.value)}
        style={{
          width: '100%',
          padding: '4px',
          fontSize: '12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          marginBottom: '8px',
        }}
      >
        {Object.entries(scenarios).map(([key, scenario]) => (
          <option key={key} value={key}>
            {scenario.description}
          </option>
        ))}
      </select>
      <div style={{ fontSize: '10px', color: '#666' }}>
        Score: {scenarios[currentScenario].passportScore.score} | 
        Threshold: {scenarios[currentScenario].passportScore.threshold}
      </div>
    </div>
  );
}