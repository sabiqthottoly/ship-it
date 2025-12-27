# Ship It 🚀

Ship It is a powerful, automated deployment tool designed to kickstart Node.js API servers on remote Ubuntu instances. It handles everything from system dependencies and Node.js installation to Nginx configuration, PM2 process management, and SSL setup with Certbot.

![Ship It UI](https://github.com/user-attachments/assets/placeholder-ui-screenshot) 

## Features

-   **One-Click Deployment**: Deploy any Node.js repository via HTTPS URL.
-   **Private Repo Support**: Integration with Git Access Tokens.
-   **Automated Provisioning**: Installs Node.js, PM2, Nginx, and Certbot automatically.
-   **Advanced Config**:
    -   **Subdirectory Support**: Deploy apps located in subfolders (e.g., `./server` or `./api`).
    -   **Environment Variables**: Directly inject `.env` contents.
    -   **Custom Ports**: Configure which port your app listens on.
-   **Domain & SSL**: Automatic Nginx reverse proxy setup and Let's Encrypt SSL provisioning.
-   **Real-time Logs**: Stream SSH execution logs directly to your browser via Server-Sent Events (SSE).

---

## Getting Started (Local Machine)

### Prerequisites
-   Node.js (v18+)
-   npm

### 1. Clone the Ship It Repo
```bash
git clone <ship-it-repo-url>
cd ship-it
```

### 2. Setup Backend
```bash
cd backend
npm install
node server.js
# Backend runs on http://localhost:3001
```

### 3. Setup Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Deployment Steps

To deploy your application using Ship It, fill out the form in the UI:

1.  **Repository URL**: The HTTPS clone URL of your project.
2.  **Git Token**: (Optional) Use this for private repositories.
3.  **Server Host**: The public IP of your target Ubuntu server.
4.  **Server Username**: The user to connect as (e.g., `root` or `ubuntu`).
5.  **App Name**: The name displayed in `pm2 list`.
6.  **Domain Name**: Your domain (e.g., `api.example.com`). Ensure your DNS A-record points to the Server Host IP.
7.  **App Port**: The port your Node.js application listens on (e.g., `3000` or `4000`).
8.  **Backend Directory**: If your code is in a subfolder, specify it (e.g., `./server`). Defaults to root.
9.  **Environment Variables**: Paste your `.env` file content here.
10. **SSH Private Key**: Paste the content of your SSH Private Key.

Click **Deploy** and watch the real-time logs!

---

## Target Server Requirements
-   **Operating System**: Ubuntu 20.04 / 22.04 LTS recommended.
-   **Permissions**: The SSH user must have `sudo` privileges without a password prompt.
-   **Architecture**: The script is optimized for Debian-based systems using `apt`.

## Troubleshooting
-   **502 Bad Gateway**: Ensure the "App Port" in the form matches the port your Node.js app is actually listening on.
-   **Connection Refused**: Verify the Server IP and ensure port 22 (SSH) is open.
-   **Timed Out**: Check your server's firewall (UFW/Cloud Security Groups) to ensure ports 80 and 443 are open for Nginx.

---

Built with ❤️ by Sabiq Thottoly.
