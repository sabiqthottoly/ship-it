const { NodeSSH } = require('node-ssh');


async function deploy(config, sendLog) {
    const ssh = new NodeSSH();
    const {
        host,
        username,
        privateKey,
        repoUrl,
        gitToken,
        appName,
        domain,
        nodeVersion = '20',
        backendDir = '.',
        envVars = '',
        port = '3000'
    } = config;

    // Sanitize inputs (trim whitespace and hidden characters)
    const cleanRepoUrl = repoUrl.trim().replace(/[\u2028\u2029]/g, '');
    const cleanGitToken = gitToken ? gitToken.trim().replace(/[\u2028\u2029]/g, '') : '';
    const homeDir = username === 'root' ? '/root' : `/home/${username}`;

    // Mask sensitive data for logging
    const safeConfig = { ...config, gitToken: cleanGitToken ? '***' : undefined, privateKey: '***' };
    sendLog(`Deployment Request Received: ${JSON.stringify(safeConfig, null, 2)}`, 'info');

    const execCommand = async (command, cwd = homeDir) => {
        sendLog(`[${new Date().toISOString()}] Executing: ${command} (CWD: ${cwd})`, 'command');
        try {
            const start = Date.now();
            const result = await ssh.execCommand(command, { cwd });
            const duration = Date.now() - start;

            if (result.stdout) sendLog(`STDOUT: ${result.stdout}`, 'stdout');
            if (result.stderr) sendLog(`STDERR: ${result.stderr}`, 'stderr');

            sendLog(`Command finished in ${duration}ms. Exit Code: ${result.code}`, 'info');

            if (result.code !== 0) {
                sendLog(`Warning: Command exited with code ${result.code}`, 'error');
            }

            // Some commands output to stderr but are not errors (like git clone status)
            // validation logic can be added here if needed
            return result;
        } catch (err) {
            throw new Error(`Command failed: ${command}. Error: ${err.message}`);
        }
    };

    try {
        try {
            sendLog(`Connecting to ${host} as ${username}...`, 'info');
            await ssh.connect({
                host,
                username,
                privateKey,
                readyTimeout: 30000
            });
        } catch (connErr) {
            sendLog(`SSH Connection Error: ${connErr.message}. Ensure your IP and Username are correct and the server accepts SSH connections.`, 'error');
            throw connErr;
        }
        sendLog('Connected!', 'success');

        // 1. System Setup
        sendLog('Updating system and installing dependencies...', 'info');
        await execCommand('sudo apt-get update');
        await execCommand('sudo apt-get install -y curl git nginx');

        // 2. Install Node.js
        sendLog(`Installing Node.js v${nodeVersion}...`, 'info');
        await execCommand(`curl -fsSL https://deb.nodesource.com/setup_${nodeVersion}.x | sudo -E bash -`);
        await execCommand('sudo apt-get install -y nodejs');

        // 3. Install PM2
        sendLog('Installing PM2...', 'info');
        await execCommand('sudo npm install -g pm2');

        // 4. Clone/Pull Repo
        const repoName = cleanRepoUrl.split('/').pop().replace('.git', '');
        const repoPath = `${homeDir}/${repoName}`;
        // Normalize backendDir to ensure it handles ./ correctly or subpaths
        const appDir = backendDir === '.' || backendDir === './'
            ? repoPath
            : `${repoPath}/${backendDir.replace(/^\.\//, '')}`;

        sendLog(`Calculated Repository Path: ${repoPath}`, 'info');
        sendLog(`Calculated App Directory (for install/build): ${appDir}`, 'info');

        // Inject token into URL if provided
        let authRepoUrl = cleanRepoUrl;
        if (cleanGitToken && cleanRepoUrl.startsWith('https://')) {
            authRepoUrl = cleanRepoUrl.replace('https://', `https://${cleanGitToken}@`);
        }

        const checkDir = await ssh.execCommand(`[ -d "${appDir}" ] && echo "exists"`);
        if (checkDir.stdout.trim() === 'exists') {
            sendLog('Repository exists. Pulling latest changes...', 'info');
            await execCommand('git pull', appDir);
        } else {
            sendLog('Cloning repository...', 'info');
            await execCommand(`git clone ${authRepoUrl}`, homeDir);
        }

        // 5. Install Dependencies & Build
        sendLog('Installing project dependencies...', 'info');
        await execCommand('npm install', appDir);
        // await execCommand('npm run build', appDir); // Optional, maybe add a flag for this

        // 5.5 Create .env file if provided
        if (envVars && envVars.trim()) {
            sendLog('Creating .env file...', 'info');
            // Escape single quotes to avoid breaking echo
            const safeEnvVars = envVars.replace(/'/g, "'\\''");
            await ssh.execCommand(`echo '${safeEnvVars}' > .env`, { cwd: appDir });
        }

        // 6. PM2 Start/Restart
        sendLog('Configuring PM2...', 'info');
        // Check if process exists
        const pm2List = await execCommand('pm2 list');
        if (pm2List.stdout.includes(appName)) {
            await execCommand(`pm2 restart ${appName}`, appDir);
        } else {
            await execCommand(`pm2 start npm --name "${appName}" -- start`, appDir);
        }
        await execCommand('pm2 save');

        // 7. Nginx Setup
        if (domain) {
            sendLog(`Configuring Nginx for ${domain}...`, 'info');
            const nginxConfig = `
server {
    listen 80;
    server_name ${domain};

    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}`;
            // Write config to temporary file then move
            const tmpConfigPath = `${homeDir}/${appName}.nginx.conf`;
            await ssh.execCommand(`echo '${nginxConfig}' > ${tmpConfigPath}`);
            await execCommand(`sudo mv ${tmpConfigPath} /etc/nginx/sites-available/${domain}`);
            await execCommand(`sudo ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/`);
            await execCommand('sudo nginx -t');
            await execCommand('sudo systemctl reload nginx');

            // 8. SSL with Certbot
            sendLog('Setting up SSL with Certbot...', 'info');
            await execCommand('sudo apt-get install -y python3-certbot-nginx');
            // Non-interactive certbot
            await execCommand(`sudo certbot --nginx -d ${domain} --non-interactive --agree-tos -m admin@${domain}`);
        }

        sendLog('Checking app status...', 'info');
        await execCommand(`pm2 show ${appName}`);
        sendLog('Recent App Logs:', 'info');
        await execCommand(`pm2 logs ${appName} --lines 50 --no-daemon`);

        sendLog('Deployment finished successfully!', 'success');

    } catch (error) {
        throw error;
    } finally {
        ssh.dispose();
    }
}

module.exports = { deploy };
