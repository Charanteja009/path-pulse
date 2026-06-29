# PathPulse 🚀
 
**AI-Powered Distributed Learning Suite**
 
PathPulse is a production-grade microservices platform that personalizes developer learning journeys. It connects to your GitHub profile, analyzes your existing codebases, identifies skill gaps, and generates dynamic, interactive roadmaps — all powered by a stateful multi-agent AI engine.
 
---
 
## ✨ Features
 
- **GitHub Skill Analysis** — Connects to your GitHub profile to parse repositories and language usage, building a structured skill map automatically
- **AI-Generated Roadmaps** — A LangGraph + Groq-powered multi-agent pipeline pinpoints missing knowledge blocks and generates personalized, step-by-step learning paths
- **Repository Explainer** — Break down any unfamiliar GitHub repository into digestible concepts
- **Secure Authentication** — JWT-based sessions with Role-Based Access Control (RBAC)
- **Roadmap Dashboard** — Track, manage, and revisit all your generated learning maps in one place
- **Fully Containerized** — One command spins up the entire stack via Docker Compose
---
 
## 🏗️ Architecture
 
PathPulse uses a decoupled microservices design. All browser traffic enters through a single Nginx gateway on port 80, which routes internally to four isolated backend services — each with its own database.
 
```
[ Browser / Next.js Frontend ]
               │
               ▼  (Port 80)
      ┌─────────────────┐
      │   Nginx Gateway │
      └────────┬────────┘
               │
     ┌─────────┼──────────┬──────────────┐
     ▼         ▼          ▼              ▼
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  Auth   │ │ Roadmap │ │  Repo   │ │   AI    │
│ Service │ │ Service │ │ Service │ │ Service │
│  :3001  │ │  :3002  │ │  :3003  │ │  :8000  │
└────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘
     ▼           ▼           ▼           ▼
PostgreSQL    MongoDB     PostgreSQL  LangGraph
(pulse_auth) (Roadmaps)  (pulse_repo)  + Groq
```
 
**Supporting infrastructure:** Redis (caching), RabbitMQ (message queue)
 
---
 
## 🔄 How It Works
 
1. **Ingestion** — User provides a career target and links their GitHub profile. The request hits Nginx, which routes it to the Repo Service.
2. **Skill Mapping** — The Repo Service calls the GitHub API, analyzes languages and repositories, and persists the skill profile to PostgreSQL.
3. **AI Generation** — The Roadmap Service passes the skill profile + career target to the AI Service. A LangGraph multi-agent pipeline (powered by Groq) identifies exact knowledge gaps.
4. **Delivery** — The finalized roadmap is saved to MongoDB and returned through the gateway to the Next.js dashboard as an interactive visual grid.
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **API Gateway** | Nginx (Alpine) |
| **Auth Service** | Node.js, Express, PostgreSQL, Sequelize, JWT |
| **Roadmap Service** | Node.js, Express, MongoDB, Mongoose |
| **Repo Service** | Node.js, Express, PostgreSQL, GitHub API |
| **AI Service** | Python 3.11, FastAPI, Uvicorn, LangGraph, Groq |
| **Message Queue** | RabbitMQ |
| **Caching** | Redis |
| **Containerization** | Docker, Docker Compose |
 
---
 
## 📁 Project Structure
 
```
path-pulse/
├── api-gateway/              # Nginx reverse proxy config
│   ├── Dockerfile
│   └── nginx.conf
│
├── frontend/                 # Next.js + Tailwind dashboard
│   └── src/app/
│       ├── components/
│       ├── dashboard/
│       ├── explainer/
│       ├── login/
│       ├── my-roadmaps/
│       └── roadmap/
│
├── services/
│   ├── auth-service/         # JWT auth, RBAC, user sessions
│   ├── roadmap-service/      # Roadmap lifecycle management
│   ├── repo-service/         # GitHub integration & skill parsing
│   └── ai-service/           # LangGraph + Groq AI engine
│
├── docker-compose.yml
└── .env                      # (create this — see setup below)
```
 
---
 
## ⚙️ Local Setup
 
### Prerequisites
 
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Git
### 1. Clone the repository
 
```bash
git clone https://github.com/Charanteja009/path-pulse.git
cd path-pulse
```
 
### 2. Create your `.env` file
 
Create a `.env` file in the project root:
 
```env
# Database
DB_USER=admin
DB_PASSWORD=password123
DB_AUTH_NAME=pulse_auth
 
# GitHub Personal Access Token
GITHUB_TOKEN=ghp_your_token_here
 
# Groq API Key
GROQ_API_KEY=gsk_your_key_here
```
 
> Get a GitHub token at [github.com/settings/tokens](https://github.com/settings/tokens) and a Groq key at [console.groq.com](https://console.groq.com).
 
### 3. Start the backend
 
```bash
docker-compose up --build
```
 
This spins up all 9 containers: Nginx, 4 microservices, PostgreSQL, MongoDB, Redis, and RabbitMQ. On first boot, the init script at `./init-db/init.sql` automatically creates the required databases (`pulse_auth`, `pulse_repos`).
 
### 4. Start the frontend
 
```bash
cd frontend
npm install
npm run dev
```
 
Open [http://localhost:3000](http://localhost:3000) in your browser.
 
---
 
## 🔍 Health Check Endpoints
 
Use these to verify routing through the gateway is working correctly:
 
| Endpoint | Target Service | What It Confirms |
|---|---|---|
| `http://localhost/api/auth` | Auth Service | Token engine + PostgreSQL status |
| `http://localhost/api/roadmap` | Roadmap Service | MongoDB collection state |
| `http://localhost/api/repo` | Repo Service | GitHub integration routing |
 
---
 
## 🌐 Language Breakdown
 
| Language | Usage |
|---|---|
| TypeScript | 49% |
| Python | 28% |
| JavaScript | 19% |
| CSS | 3% |
| Dockerfile | 1% |
 
---
 
## 📄 License
 
This project is open source. Feel free to use, fork, and build on it.
