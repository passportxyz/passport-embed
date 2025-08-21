import { useState, useEffect } from 'react';
import { scenarios, ScenarioName, setScenario } from '../mocks/scenarios';

export function ScenarioSwitcher() {
  const [currentScenario, setCurrentScenario] = useState<ScenarioName>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development with MSW enabled
    if (import.meta.env.VITE_ENABLE_MSW === 'true') {
      setIsVisible(true);
      
      // Get current scenario from localStorage or URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlScenario = urlParams.get('scenario') as ScenarioName;
      const storedScenario = localStorage.getItem('msw-scenario') as ScenarioName;
      
      if (urlScenario && scenarios[urlScenario]) {
        setCurrentScenario(urlScenario);
      } else if (storedScenario && scenarios[storedScenario]) {
        setCurrentScenario(storedScenario);
      }
    }
  }, []);

  if (!isVisible) return null;

  const handleScenarioChange = (name: ScenarioName) => {
    setCurrentScenario(name);
    setScenario(name);
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
        onChange={(e) => handleScenarioChange(e.target.value as ScenarioName)}
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
      <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
        Stamps: {Object.keys(scenarios[currentScenario].passportScore.stamps).length} | 
        Can add: {scenarios[currentScenario].canAddStamps ? '✓' : '✗'}
      </div>
    </div>
  );
}