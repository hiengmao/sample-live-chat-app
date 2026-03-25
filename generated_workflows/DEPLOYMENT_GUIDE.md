# GitHub Actions Deployment Guide

This guide explains how to set up and configure the automated CI/CD pipelines for the Live Chat Application using GitHub Actions.

## Overview

The repository includes four main workflows:

1. **CI Workflow** (`ci.yml`) - Runs on every push and PR
2. **Deployment Workflow** (`deploy.yml`) - Deploys to various platforms
3. **Docker Deployment** (`docker-deploy.yml`) - Builds and pushes Docker images
4. **Security & Quality** (`security.yml`) - Security scans and code quality checks

## Workflow Details

### 1. CI Workflow (`ci.yml`)

**Triggers:** 
- Push to `main`, `develop`, or `feat/workflow` branches
- Pull requests to `main` and `develop` branches

**Jobs:**
- **test**: Runs on Node.js 20.x and 22.x
  - Installs dependencies
  - Runs format checks
  - Runs linter
  - Runs tests
  - Builds the project
  
- **docker-build**: Runs after tests pass on main branch only
  - Builds Docker image
  - Pushes to Docker Hub (if credentials provided)
  - Uses Docker buildx for layer caching

### 2. Deployment Workflow (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via `workflow_dispatch`

**Deployment Options** (configure at least one):

#### Vercel
```
Required secrets:
- VERCEL_TOKEN
- VERCEL_PROJECT_ID
- VERCEL_ORG_ID
```

#### Netlify
```
Required secrets:
- NETLIFY_AUTH_TOKEN
- NETLIFY_SITE_ID
```

#### Heroku
```
Required secrets:
- HEROKU_API_KEY
- HEROKU_APP_NAME
```

#### Slack Notifications
```
Optional secret:
- SLACK_WEBHOOK (for deployment status notifications)
```

### 3. Docker Deployment (`docker-deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger with environment selection

**Jobs:**

#### Build and Push
- Builds multi-architecture Docker images
- Pushes to Docker Hub and GitHub Container Registry
- Supports semantic versioning and branch tags
- Uses GitHub Actions layer caching

#### Kubernetes Deployment
- Requires `KUBE_CONFIG` secret (base64-encoded kubeconfig file)
- Updates deployment image
- Monitors rollout status

#### Portainer Deployment
- Requires `PORTAINER_URL`, `PORTAINER_API_KEY`, `PORTAINER_WEBHOOK_ID`
- Deploys via Portainer API

### 4. Security & Quality Workflow (`security.yml`)

**Triggers:**
- Push to `main` and `develop`
- Pull requests
- Weekly schedule (Sunday 2 AM UTC)

**Checks:**
- npm audit
- Snyk vulnerability scanning
- Dependency review
- ESLint code quality
- SonarQube analysis
- Trivy container image scanning

## Setup Instructions

### Step 1: Basic Setup (Required)

1. Ensure your repository is on GitHub
2. Workflows are automatically discovered in `.github/workflows/` directory
3. No additional configuration needed for CI workflow - it runs with npm scripts

### Step 2: Configure Secrets (Optional)

Go to **Settings → Secrets and variables → Actions** and add the following:

#### Docker Hub (for docker-build job)
```
DOCKER_USERNAME=your_dockerhub_username
DOCKER_PASSWORD=your_dockerhub_token
```

#### Vercel Deployment
```
VERCEL_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=your_project_id
VERCEL_ORG_ID=your_org_id
```

#### Netlify Deployment
```
NETLIFY_AUTH_TOKEN=your_netlify_token
NETLIFY_SITE_ID=your_site_id
```

#### Heroku Deployment
```
HEROKU_API_KEY=your_heroku_api_key
HEROKU_APP_NAME=your_app_name
```

#### Kubernetes Deployment
```
KUBE_CONFIG=<base64-encoded kubeconfig file>
```
To encode your kubeconfig:
```bash
cat ~/.kube/config | base64
```

#### Portainer Deployment
```
PORTAINER_URL=https://your-portainer-instance.com
PORTAINER_API_KEY=your_api_key
PORTAINER_WEBHOOK_ID=your_webhook_id
```

#### Security Tools
```
SNYK_TOKEN=your_snyk_token
SONAR_HOST_URL=https://sonarcloud.io
SONAR_TOKEN=your_sonar_token
```

#### Slack Notifications
```
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Step 3: Configure Environments (Optional)

For production deployments, create a production environment:

1. Go to **Settings → Environments**
2. Click **New environment**
3. Name: `production`
4. Add deployment branch protection (optional)
5. Add environment-specific secrets if needed

### Step 4: Environment Variables

Create or update `.env.local` for local development:

```
GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:3000
```

## Monitoring and Troubleshooting

### View Workflow Runs

1. Go to **Actions** tab in your repository
2. Click on specific workflow
3. Select a run to see detailed logs

### Common Issues

#### Build Fails - Dependencies
```bash
# Clear npm cache locally first
npm cache clean --force
npm install
```

#### Docker Build Fails
- Ensure Dockerfile is in repository root
- Check for proper Node.js version compatibility (22-slim recommended)
- Verify Docker secrets are set correctly

#### Deployment Fails
- Check that deployment platform secrets are valid and not expired
- Verify environment variables are set in the target platform
- Ensure the GEMINI_API_KEY is set as a secret in the deployment platform

#### Tests Fail
- Run locally: `npm test`
- Check test output in Actions logs
- Verify all dependencies installed: `npm install`

### Debug Tips

1. **Enable debug logging:**
   ```
   Set secret: ACTIONS_STEP_DEBUG = true
   ```

2. **Check workflow syntax:**
   ```bash
   # Install act locally to test workflows
   npm install -g act
   act
   ```

## Advanced Configuration

### Custom Docker Image Tags

Modify `docker-deploy.yml` tags section:
```yaml
tags: |
  your-registry/your-image:latest
  your-registry/your-image:${{ github.sha }}
  your-registry/your-image:${{ github.ref_name }}
```

### Branch-Specific Deployments

Add conditions to deployment jobs:
```yaml
deploy:
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  # ... rest of job
```

### Matrix Builds for Multiple Node Versions

Already configured in `ci.yml` for testing:
```yaml
strategy:
  matrix:
    node-version: [20.x, 22.x]
```

### Scheduled Jobs

The security workflow runs on a schedule:
```yaml
schedule:
  - cron: '0 2 * * 0'  # Weekly Sunday 2 AM UTC
```

## Best Practices

1. **Secrets Management**
   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate secrets periodically

2. **Branch Protection**
   - Require status checks to pass before PR merge
   - Go to **Settings → Branches → Branch protection rules**
   - Require workflows to pass

3. **Notifications**
   - Configure Slack notifications for failures
   - Set up email notifications in GitHub settings

4. **Deployment Strategy**
   - Test on staging first
   - Use environment-specific secrets
   - Enable production environment protection

5. **Performance**
   - Use `cache: npm` in setup-node for faster builds
   - Docker layer caching is enabled by default
   - Use GitHub Actions caching for deps

## File Structure

```
.github/
  workflows/
    ci.yml              # Main CI pipeline
    deploy.yml          # Multi-platform deployment
    docker-deploy.yml   # Docker build and push
    security.yml        # Security and quality checks
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GH Actions for Node.js](https://github.com/actions/setup-node)
- [Docker Build Action](https://github.com/docker/build-push-action)
- [Vercel Deploy Action](https://github.com/vercel/actions)
- [Netlify Deploy Action](https://github.com/nwtgck/actions-netlify)

## Support

For issues or questions:
1. Check workflow logs in Actions tab
2. Review error messages carefully
3. Consult GitHub Actions documentation
4. Check platform-specific deployment docs
