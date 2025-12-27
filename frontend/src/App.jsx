import React, { useState } from 'react';
import DeployForm from './components/DeployForm';
import LogViewer from './components/LogViewer';
import { Terminal } from 'lucide-react';

function App() {
  const [logs, setLogs] = useState([]);
  const [isDeploying, setIsDeploying] = useState(false);

  const handleDeploy = async (config) => {
    setIsDeploying(true);
    setLogs([]); // Clear previous logs

    try {
      const response = await fetch('http://localhost:3001/api/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        lines.forEach(line => {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              setLogs(prev => [...prev, data]);
              if (data.type === 'error' || data.type === 'success' && data.message.includes('finished')) {
                // Could optionally stop loading here, but stream end handles it
              }
            } catch (e) {
              console.error('Error parsing log:', e);
            }
          }
        });
      }
    } catch (error) {
      setLogs(prev => [...prev, { message: `Connection failed: ${error.message}`, type: 'error', timestamp: new Date().toISOString() }]);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <Terminal size={40} color="#58a6ff" />
          Ship <span style={{ color: '#58a6ff' }}>It</span>
        </h1>
        <p style={{ color: '#8b949e' }}>Automated Node.js Server Provisioning & Deployment</p>
      </header>

      <DeployForm onDeploy={handleDeploy} isDeploying={isDeploying} />

      <LogViewer logs={logs} />

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: '#8b949e', borderTop: '1px solid #30363d', paddingTop: '2rem' }}>
        Built with ❤️ by <a href="https://github.com/sabiqthottoly" target="_blank" rel="noopener noreferrer" style={{ color: '#58a6ff', textDecoration: 'none' }}>Sabiq Thottoly</a>
      </footer>
    </div>
  );
}

export default App;
