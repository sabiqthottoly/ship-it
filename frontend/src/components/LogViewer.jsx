import React, { useEffect, useRef } from 'react';

export default function LogViewer({ logs }) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="glass-panel" style={{ marginTop: '2rem' }}>
            <h3>Deployment Logs</h3>
            <div className="log-terminal">
                {logs.length === 0 && <div className="text-secondary">Waiting for deployment to start...</div>}
                {logs.map((log, index) => (
                    <div key={index} className={`log-entry log-${log.type}`}>
                        <span style={{ opacity: 0.5, marginRight: '10px' }}>
                            [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        {log.message}
                    </div>
                ))}
                <div ref={endRef} />
            </div>
        </div>
    );
}
