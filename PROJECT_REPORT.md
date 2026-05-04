# Minor Project Report

## Title

Cloud-Native Task Management System with CI/CD Pipeline

## Problem Statement

Deploying applications manually is slow and error-prone. This project demonstrates how a simple task management application can be prepared for cloud deployment using Docker, Kubernetes, and CI/CD.

## Objective

The objective is to build a small task management system and focus mainly on the cloud deployment pipeline.

## Modules

| Module | Purpose |
| --- | --- |
| Frontend | React UI for login and task management |
| Backend API | Node.js API for login and task CRUD |
| Docker | Containerizes frontend and backend |
| Kubernetes | Runs app on cloud cluster |
| CI/CD | Automates test, build, push, and deployment |

## Technology Used

- React
- Node.js
- Express.js
- JWT
- Docker
- Kubernetes
- GitHub Actions

## Deployment Flow

```txt
Code Push
  -> GitHub Actions
  -> Test Backend
  -> Build Frontend
  -> Build Docker Images
  -> Push Images to Registry
  -> Deploy to Kubernetes
```

## Conclusion

The project proves the cloud deployment lifecycle using a simple task management application. The focus is on CI/CD, Docker images, Kubernetes deployment, ingress routing, and cloud readiness.
