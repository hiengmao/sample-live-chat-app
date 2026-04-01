# CD


# 🔐 Prepare Secrets in GitHub

Go to your repo → **Settings → Secrets → Actions**

Add:

* `DOCKER_USERNAME`
* `DOCKER_PASSWORD`
* `SERVER_HOST`
* `SERVER_PORT`
* `SERVER_USER`
* `SSH_PRIVATE_KEY`

---

# 🚀 7. GitHub Actions Workflow

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to Swarm

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Login to Docker Hub
      - name: Login Docker
        run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin

      # Build & push backend
      - name: Build Backend
        run: |
          docker build -t ${{ secrets.DOCKER_USERNAME }}/chat-backend:latest ./backend
          docker push ${{ secrets.DOCKER_USERNAME }}/chat-backend:latest

      # Build & push frontend
      - name: Build Frontend
        run: |
          docker build -t ${{ secrets.DOCKER_USERNAME }}/chat-frontend:latest ./frontend
          docker push ${{ secrets.DOCKER_USERNAME }}/chat-frontend:latest

      # SSH deploy
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /root/project
            docker pull ${{ secrets.DOCKER_USERNAME }}/chat-backend:latest
            docker pull ${{ secrets.DOCKER_USERNAME }}/chat-frontend:latest
            docker stack deploy -c docker-stack.yml chat
```
