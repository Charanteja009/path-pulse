# PathPulse 🚀
### AI-Powered Distributed Learning Suite & Repository Explainer

PathPulse is a distributed microservices-based platform designed to help developers master new technologies, understand unfamiliar repositories, and follow personalized learning roadmaps.

The platform combines AI-generated roadmaps, repository analysis, authentication, and progress tracking into a scalable multi-service architecture powered by Docker and PostgreSQL.

---

## Features

- Personalized AI-generated learning roadmaps
- GitHub repository explainer with project breakdown
- User authentication and secure session management
- Roadmap progress tracking dashboard
- Microservices architecture with isolated services
- Containerized deployment using Docker Compose
- Interactive frontend built with Next.js and Tailwind CSS

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | Next.js, React, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI Service | Python, Groq API |
| Database | PostgreSQL |
| Authentication | JWT |
| Reverse Proxy | Nginx |
| Containerization | Docker, Docker Compose |
| Architecture | Microservices |

---

## Folder Structure

```text
path-pulse/
│
├── api-gateway/
│   ├── Dockerfile
│   └── nginx.conf
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── app/
│   │       ├── components/
│   │       ├── dashboard/
│   │       ├── explainer/
│   │       ├── login/
│   │       ├── my-roadmaps/
│   │       ├── roadmap/
│   │       ├── favicon.ico
│   │       ├── globals.css
│   │       ├── layout.tsx
│   │       └── page.tsx
│   │
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.mjs
│   ├── next.config.ts
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── services/
│   ├── ai-service/
│   │   ├── app/
│   │   ├── Dockerfile
│   │   ├── checkpoints.db-shm
│   │   ├── checkpoints.db-wal
│   │   └── requirements.txt
│   │
│   ├── auth-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package-lock.json
│   │   └── package.json
│   │
│   ├── repo-service/
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── package-lock.json
│   │   └── package.json
│   │
│   └── roadmap-service/
│       ├── src/
│       ├── Dockerfile
│       ├── package-lock.json
│       └── package.json
│
├── .gitignore
├── code.py
├── docker-compose.yml
├── package-lock.json
├── package.json
└── README.md
```
## Architecture Overview
```
                           ┌────────────────────┐
                           │     Frontend       │
                           │ Next.js + React UI │
                           └─────────┬──────────┘
                                     │
                                     ▼
                           ┌────────────────────┐
                           │    API Gateway     │
                           │ Nginx Reverse Proxy│
                           └─────────┬──────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Auth Service   │       │ Roadmap Service │       │  Repo Service   │
│ Node.js + JWT   │       │ Roadmap Engine  │       │ Repo Explainer  │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │    AI Service    │
                         │ Python + Groq AI │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   PostgreSQL DB  │
                         └──────────────────┘
```

