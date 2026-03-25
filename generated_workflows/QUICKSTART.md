# Quick Start - GitHub Actions Deployment

## What's Included

Your repository now has automated CI/CD pipelines:

| Workflow | File | Runs On | Purpose |
|----------|------|---------|---------|
| **CI** | `ci.yml` | Every push & PR | Test, lint, build |
| **Deploy** | `deploy.yml` | Main push/manual | Deploy to Vercel, Netlify, Heroku |
| **Docker Deploy** | `docker-deploy.yml` | Main push | Build & push Docker images, deploy to K8s/Portainer |
| **Security** | `security.yml` | Scheduled/push/PR | Security scans, code quality |

## 30-Second Setup

### 1. No Configuration Needed (Works Out of Box)
The CI workflow runs automatically on every push and pull request.

### 2. Optional: Add Docker Hub Deployment
```bash
# 1. Generate Docker Hub token at https://hub.docker.com/settings/security
# 2. Add secrets to GitHub:
gh secret set DOCKER_USERNAME -b "your_username"
gh secret set DOCKER_PASSWORD -b "your_token"
# 3. Push to trigger workflow
git push
```

### 3. Optional: Add Platform Deployment
Choose one or more:

**Vercel:**
```bash
gh secret set VERCEL_TOKEN -b "your_token"
gh secret set VERCEL_PROJECT_ID -b "proj_xxx"
gh secret set VERCEL_ORG_ID -b "team_xxx"
```

**Netlify:**
```bash
gh secret set NETLIFY_AUTH_TOKEN -b "your_token"
gh secret set NETLIFY_SITE_ID -b "your_site_id"
```

**Heroku:**
```bash
gh secret set HEROKU_API_KEY -b "your_token"
gh secret set HEROKU_APP_NAME -b "your-app-name"
```

## View Workflow Results

1. Go to GitHub repository
2. Click **Actions** tab
3. See all workflow runs
4. Click to see detailed logs

## Manual Trigger

The deploy workflow can be triggered manually:
```bash
# Via GitHub CLI
gh workflow run deploy.yml

# Via GitHub web UI
Actions → Deploy to Production → Run workflow
```

## Key Features

✅ **CI Workflow**
- Tests on Node 20 & 22
- Linting & formatting
- Builds application
- Runs full test suite
- Auto-builds Docker image

✅ **Deployment Options**
- Vercel (automatic)
- Netlify (automatic)
- Heroku (git push)
- Kubernetes (API-based)
- Portainer (webhook)
- Docker Hub/GHCR push

✅ **Security**
- npm audit
- Dependency scanning
- Container image scan (Trivy)
- Optional Snyk/SonarQube

✅ **Production Ready**
- Multi-stage Docker builds
- Layer caching
- Environment protection
- Slack notifications (optional)

## Common Commands

```bash
# View all secrets
gh secret list

# Add a secret
gh secret set SECRET_NAME -b "secret_value"

# Remove a secret
gh secret delete SECRET_NAME

# List workflows
gh workflow list

# Run workflow manually
gh workflow run docker-deploy.yml

# View workflow runs
gh run list

# Check specific workflow run
gh run view <run-id>
```

## Environment Variables

For the app to work, set these in your deployment platform:

```
GEMINI_API_KEY=<your_api_key>
VITE_API_URL=<backend_url>
```

**Heroku example:**
```bash
heroku config:set GEMINI_API_KEY=xxx
```

**Vercel example:**
Add to `.vercel.json` or environment settings

**Netlify example:**
Site settings → Build & deploy → Environment → Variables

## Troubleshooting

### Build fails
```bash
# Check npm scripts work locally
npm install
npm run lint
npm test
npm run build
```

### Docker image won't push
- Verify Docker Hub credentials: `docker login`
- Check token hasn't expired
- Ensure Docker username is correct

### Deployment fails
- Check platform-specific logs
- Verify environment variables are set
- Make sure secrets aren't expired

### Tests fail
```bash
# Run locally to debug
npm test

# Run specific test
npm test -- src/test/App.test.tsx
```

## Full Documentation

See detailed guides:
- [DEPLOYMENT_GUIDE.md](.github/DEPLOYMENT_GUIDE.md) - Complete setup guide
- [SECRETS_CONFIG.md](.github/SECRETS_CONFIG.md) - All secrets configuration

## Next Steps

1. ✅ Workflows are ready (no setup needed for CI)
2. 📝 Add deployment secrets (optional)
3. 🚀 Push to trigger first run
4. 📊 Monitor in Actions tab
5. 🔧 Customize for your needs

## Support

- **GitHub Actions Docs**: https://docs.github.com/actions
- **Local Testing**: Install `act` CLI for local workflow testing
- **Troubleshooting**: Check Actions logs for detailed error messages
