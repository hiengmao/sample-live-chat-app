# Github Actions Secrets

Here’s a clear, **step-by-step guide** to creating and using **GitHub Actions secrets** to deploy to your server (typical SSH-based deployment).

---

# 🧩 Overview

You’ll do 3 main things:

1. Generate an SSH key pair
2. Add the public key to your server
3. Store the private key + config as GitHub Secrets
4. Use them in your GitHub Actions workflow

---

# 🔐 Step 1: Generate SSH Key Pair (on your local machine)

Run:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

When prompted:

* File: `.ssh/id_ed25519_github_action`. Press Enter (default: `~/.ssh/id_ed25519`)
* Passphrase: **leave empty** (important for automation)

This creates:

* Private key → `~/.ssh/id_ed25519_github_action`
* Public key → `~/.ssh/id_ed25519_github_action.pub`

![ssh genereated](./ssh_step1.png)
---

# 🖥️ Step 2: Add Public Key to Your Server

Copy your public key:

```bash
cat ~/.ssh/id_ed25519_github_action.pub
```

Then SSH into your server:

```bash
ssh user@your-server-ip
```

Add the key:

```bash
mkdir -p ~/.ssh
nano ~/.ssh/authorized_keys
```

Paste the public key.

Set permissions:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

---

# 🧪 Step 3: Test SSH Access

From your local machine:

```bash
ssh user@your-server-ip -i .ssh/id_ed25519_github_action
```

If it logs in **without password**, you're good ✅

---

# 🔑 Step 4: Add Secrets to GitHub

Go to your repo:

👉 **Settings → Secrets and variables → Actions → New repository secret**

Add these:

### 1. Private Key

* Name: `SSH_PRIVATE_KEY`
* Value:

```bash
cat ~/.ssh/id_ed25519_github_action
```

(paste entire content including `-----BEGIN OPENSSH PRIVATE KEY-----`)

![add repo secret](./add-repo-secret.png)
---

### 2. Server Info

Add these secrets:

| Name          | Value                 |
| ------------- | --------------------- |
| `SERVER_HOST` | your server IP/domain |
| `SERVER_USER` | your SSH username     |
| `SERVER_PORT` | usually `22`          |

![repo secrets](./repo-secrets.png)
---

# 🧠 Key Notes (Important)

### ❗ Never expose secrets

* Do NOT print secrets in logs
* Do NOT commit `.ssh` files

---

### 🔐 Use deploy-specific key

Don’t reuse your personal SSH key — generate a dedicated one.

---

### 🧪 Optional: Use separate deploy user

On server:

```bash
adduser deploy
```

Give minimal permissions → more secure.

---

# 🚀 Optional Enhancements

### Use `.env` secrets

Add secrets like:

* `ENV_PRODUCTION`
* `DATABASE_URL`

Then:

```yaml
echo "${{ secrets.ENV_PRODUCTION }}" > .env
```

---

### Use rsync instead of git pull

```bash
rsync -avz . user@server:/app
```

---

# ✅ Summary

You:

1. Created SSH keys
2. Authorized GitHub to access your server
3. Stored credentials safely in GitHub Secrets
4. Used them in a CI/CD workflow

---
