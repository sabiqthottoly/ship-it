import React, { useState } from 'react';
import { Rocket, Server, Github, Lock, Globe, Box } from 'lucide-react';

export default function DeployForm({ onDeploy, isDeploying }) {
    const [formData, setFormData] = useState({
        repoUrl: '',
        gitToken: '',
        host: '',
        username: '',
        privateKey: '',
        appName: '',
        domain: '',
        nodeVersion: '20',
        backendDir: './',
        envVars: '',
        port: '3000'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onDeploy(formData);
    };

    return (
        <div className="glass-panel">
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                    <div className="input-group">
                        <label className="input-label"><Github size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> Repository URL</label>
                        <input
                            type="text"
                            name="repoUrl"
                            className="input-field"
                            placeholder="https://github.com/user/repo.git"
                            value={formData.repoUrl}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label"><Lock size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> Git Access Token (Optional)</label>
                        <input
                            type="password"
                            name="gitToken"
                            className="input-field"
                            placeholder="ghp_xxxxxxxxxxxx"
                            value={formData.gitToken}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label"><Server size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> Server Host IP</label>
                        <input
                            type="text"
                            name="host"
                            className="input-field"
                            placeholder="192.168.1.1"
                            value={formData.host}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Server Username</label>
                        <input
                            type="text"
                            name="username"
                            className="input-field"
                            placeholder="ubuntu"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label"><Box size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> App Name (PM2)</label>
                        <input
                            type="text"
                            name="appName"
                            className="input-field"
                            placeholder="my-app"
                            value={formData.appName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label"><Globe size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> Domain Name (Optional)</label>
                        <input
                            type="text"
                            name="domain"
                            className="input-field"
                            placeholder="example.com"
                            value={formData.domain}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Backend Directory (Optional)</label>
                        <input
                            type="text"
                            name="backendDir"
                            className="input-field"
                            placeholder="./ or ./api"
                            value={formData.backendDir}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">App Port</label>
                        <input
                            type="text"
                            name="port"
                            className="input-field"
                            placeholder="3000"
                            value={formData.port}
                            onChange={handleChange}
                            required
                        />
                    </div>

                </div>

                <div className="input-group">
                    <label className="input-label">Environment Variables (.env content)</label>
                    <textarea
                        name="envVars"
                        className="input-field"
                        placeholder="PORT=3000&#10;DB_HOST=localhost"
                        rows={4}
                        value={formData.envVars}
                        onChange={handleChange}
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label"><Lock size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '5px' }} /> SSH Private Key</label>
                    <textarea
                        name="privateKey"
                        className="input-field"
                        placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                        rows={5}
                        value={formData.privateKey}
                        onChange={handleChange}
                        required
                        style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={isDeploying}>
                    {isDeploying ? 'Deploying...' : <><Rocket size={18} style={{ marginRight: '8px' }} /> Deploy to Server</>}
                </button>
            </form>
        </div>
    );
}
