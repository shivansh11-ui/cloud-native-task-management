# Cloud-Native Task Management System with CI/CD Pipeline

## Main Goal

The main goal of this project is **cloud deployment**, not building a complex task app.

This project shows how a simple task management application can be containerized, tested, built, pushed to a container registry, and deployed to Kubernetes using a CI/CD pipeline.

## Simple Architecture

```txt
User
  -> React Frontend
  -> Node.js Backend API
  -> Docker Images
  -> Container Registry
  -> Kubernetes Cluster
  -> Public Cloud URL
```

## Features

- Login with JWT token
- Create task
- View tasks
- Update task status
- Delete task
- Task-created notification log
- Backend health endpoint
- Docker support
- Kubernetes deployment
- CI/CD pipeline using GitHub Actions

## Why This Is Cloud Native

- Frontend and backend are containerized with Docker.
- Kubernetes runs the application as scalable deployments.
- Ingress exposes the app through one public cloud URL.
- Health checks allow Kubernetes to monitor the app.
- Resource limits make the app cloud-ready.
- CI/CD pipeline tests, builds, pushes images, and deploys.

## Local Run Without Docker

Backend:

```powershell
cd backend
npm install
npm start
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Local Run With Docker

```powershell
docker compose up --build
```

Open:

```txt
http://localhost:3000
```

## CI/CD Flow

```txt
Developer pushes code to GitHub
  -> GitHub Actions starts
  -> Backend tests run
  -> Frontend build runs
  -> Docker images are built
  -> Images are pushed to registry
  -> Kubernetes deployment is updated
```

## Required GitHub Secrets

```txt
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
KUBE_CONFIG_BASE64
CLOUD_HOST
```

For the first CI/CD demo, only `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are required. Kubernetes secrets are needed later when you connect a real cloud cluster.

## Viva Explanation

This is a simple task management system built to demonstrate cloud deployment. The application is intentionally small, but it follows cloud-native practices such as Docker containerization, Kubernetes deployment, health checks, scaling, ingress routing, and CI/CD automation.
