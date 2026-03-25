# GitHub Actions Secrets Configuration Template

This file documents all the secrets needed for different deployment scenarios.
Copy and paste the relevant sections into your GitHub Repository Secrets.

## 1. Docker Hub Configuration

**Location:** Settings → Secrets and variables → Actions

```
Secret Name: DOCKER_USERNAME
Value: your_dockerhub_username

Secret Name: DOCKER_PASSWORD
Value: <generate token at https://hub.docker.com/settings/security>
```

**How to create Docker Hub Token:**
1. Go to Docker Hub → Account Settings → Security
2. Click "New Access Token"
3. Give it a name (e.g., "GitHub Actions")
4. Copy the token and paste as DOCKER_PASSWORD

## 2. Vercel Deployment

```
Secret Name: VERCEL_TOKEN
Value: <generate at https://vercel.com/account/tokens>

Secret Name: VERCEL_PROJECT_ID
Value: <from vercel.json in your project or Vercel dashboard>

Secret Name: VERCEL_ORG_ID
Value: <your Vercel team ID or personal ID>
```

**How to create Vercel Token:**
1. Go to vercel.com/account/tokens
2. Click "Create new"
3. Name it "GitHub Actions"
4. Copy and paste in GitHub Secrets

## 3. Netlify Deployment

```
Secret Name: NETLIFY_AUTH_TOKEN
Value: <generate at https://app.netlify.com/account/applications>

Secret Name: NETLIFY_SITE_ID
Value: <from Site settings → General → Site details>
```

**How to create Netlify Token:**
1. Go to netlify.com → User menu → Applications
2. Click "New access token"
3. Copy the token

## 4. Heroku Deployment

```
Secret Name: HEROKU_API_KEY
Value: <generate at https://dashboard.heroku.com/account/applications/authorizations/new>

Secret Name: HEROKU_APP_NAME
Value: your-app-name
```

**How to create Heroku API Key:**
1. Go to Heroku Dashboard → Manage Account → API tokens
2. Click "Create authorization"
3. Copy the token

## 5. Kubernetes Deployment

```
Secret Name: KUBE_CONFIG
Value: <base64-encoded kubeconfig file>
```

**How to get base64-encoded kubeconfig:**
```bash
# If kubeconfig is at ~/.kube/config
cat ~/.kube/config | base64

# Or for specific context
kubectl config view --raw | base64

# On macOS
cat ~/.kube/config | base64 -b 0
```

**Or create minimal kubeconfig:**
1. Get cluster info: `kubectl cluster-info`
2. Get credentials: `kubectl config view --raw`
3. Copy entire output, encode with base64

## 6. Portainer Deployment

```
Secret Name: PORTAINER_URL
Value: https://your-portainer-instance.com

Secret Name: PORTAINER_API_KEY
Value: <generate in Portainer → Settings → API tokens>

Secret Name: PORTAINER_WEBHOOK_ID
Value: <from your webhook configuration>
```

## 7. Security Tools

### Snyk

```
Secret Name: SNYK_TOKEN
Value: <generate at https://app.snyk.io/account/api-token>
```

### SonarQube / SonarCloud

```
Secret Name: SONAR_TOKEN
Value: <generate at https://sonarcloud.io/account/security>

Secret Name: SONAR_HOST_URL
Value: https://sonarcloud.io
```

## 8. Slack Notifications

```
Secret Name: SLACK_WEBHOOK
Value: <generate at https://api.slack.com/apps>
```

**How to create Slack Webhook:**
1. Go to api.slack.com/apps
2. Create New App
3. Go to "Incoming Webhooks"
4. Add New Webhook to Workspace
5. Copy Webhook URL

## 9. Application Secrets

```
Secret Name: GEMINI_API_KEY
Value: <your Google Gemini API key>
```

## Setting Secrets in GitHub

### Via Web UI:
1. Go to repository → Settings
2. Click "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Enter Name and Value
5. Click "Add secret"

### Via GitHub CLI:
```bash
# List all secrets
gh secret list

# Set secret
gh secret set DOCKER_USERNAME -b "your_username"

# Delete secret
gh secret delete DOCKER_USERNAME
```

### Via shell script:
```bash
#!/bin/bash
# secrets.sh - Set multiple secrets

gh secret set DOCKER_USERNAME -b "your_username"
gh secret set DOCKER_PASSWORD -b "your_token"
gh secret set VERCEL_TOKEN -b "your_token"
gh secret set NETLIFY_AUTH_TOKEN -b "your_token"

echo "All secrets configured!"
```

Run with: `bash secrets.sh`

## Environment-Specific Secrets

For production-only secrets:

1. Create "production" environment
2. Go to Settings → Environments → production
3. Add environment-specific secrets
4. In workflow, use: `environment: production`

Example workflow section:
```yaml
deploy:
  runs-on: ubuntu-latest
  environment: production
  
  steps:
    - name: Deploy
      env:
        PROD_API_KEY: ${{ secrets.PROD_API_KEY }}
      run: npm run deploy
```

## Secret Best Practices

✅ **DO:**
- Rotate secrets regularly (especially API keys)
- Use GitHub's Secret Scanner to detect exposed secrets
- Store tokens with minimal required permissions
- Use environment-specific secrets for production
- Document what each secret is for

❌ **DON'T:**
- Commit secrets to repository
- Share secrets in logs or terminal output
- Use the same secret for multiple platforms
- Leave development tokens in production
- Create tokens without expiration

## Verifying Secrets Are Set

```bash
# GitHub CLI - list secrets (NOT values)
gh secret list

# Check if workflow can access secret
# (will show ✓ if set, blank if not)
```

## Troubleshooting

### "Resource not found" error
- Secret not set for the repository
- Check spelling matches exactly (case-sensitive)
- Might be organization-level secret issue

### Workflow can't access secret
1. Check secret is set: `gh secret list`
2. Verify spelling in workflow YAML
3. Ensure workflow has permission to use secrets
4. Check GitHub Actions logs for exact error

### Expired API tokens
Common tokens that expire:
- Heroku API keys (expire after a year)
- GitHub Personal Access Tokens
- Snyk API tokens

**When tokens expire:**
1. Generate new token
2. Update GitHub Secret: `gh secret set NAME -b "new_value"`
3. Redeploy with new workflow run

## Cleanup

To remove secrets you no longer need:

```bash
gh secret delete DOCKER_USERNAME
gh secret delete VERCEL_TOKEN
```

Or via UI:
1. Settings → Secrets and variables → Actions
2. Click the secret
3. Click "Delete"
