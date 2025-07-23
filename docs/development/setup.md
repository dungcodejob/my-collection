# Development Setup Guide

## 🚀 Development Environment Setup Guide

### 📋 Prerequisites

Before starting, make sure you have installed:

| Tool | Version | Purpose | Download |
|------|---------|---------|----------|
| **Node.js** | 18+ LTS | JavaScript runtime | [nodejs.org](https://nodejs.org) |
| **pnpm** | Latest | Package manager | [pnpm.io](https://pnpm.io) |
| **Docker** | Latest | Containerization | [docker.com](https://docker.com) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com) |

### 🔧 Version Check

```bash
# Check Node.js
node --version  # Should be 18+

# Check pnpm
pnpm --version

# Check Docker
docker --version
docker-compose --version

# Check Git
git --version
```

## 📁 Clone Repository

```bash
# Clone repository
git clone <repository-url>
cd my-collection

# Check structure
ls -la
```

## 🐳 Setup Infrastructure Services

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis
cd deployments/docker-compose
docker-compose -f infrastructure.yaml up -d

# Check running services
docker-compose -f infrastructure.yaml ps
```

### 2. Verify Database Connection

```bash
# Connect to PostgreSQL
docker exec -it postgres_container psql -U postgres -d my_collection

# Connect to Redis
docker exec -it redis_container redis-cli ping
```

## 🎨 Frontend Setup

### 1. Install Dependencies

```bash
cd client
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp src/environments/environment.example.ts src/environments/environment.ts

# Edit environment file
# Update API URLs, keys, etc.
```

### 3. Start Development Server

```bash
# Start Angular dev server
pnpm start

# Or with specific configuration
pnpm nx serve client --configuration=development
```

### 4. Verify Frontend

- Open browser: `http://localhost:4200`
- Check console for errors
- Verify hot reload works

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
cd server
pnpm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your settings
```

### 3. Database Setup

```bash
# Generate initial migration
pnpm migration:generate -- src/data/migrations/initial-setup

# Run migrations
pnpm migration:run

# Seed database (optional)
pnpm seed:run
```

### 4. Start Development Server

```bash
# Start NestJS dev server
pnpm start:dev

# Or with debug mode
pnpm start:debug
```

### 5. Verify Backend

- API: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/swagger`
- Health check: `http://localhost:3000/health`

## 🔗 Full Stack Development

### 1. Start All Services

```bash
# Terminal 1: Infrastructure
cd deployments/docker-compose
docker-compose -f infrastructure.yaml up -d

# Terminal 2: Backend
cd server
pnpm start:dev

# Terminal 3: Frontend
cd client
pnpm start
```

### 2. Development URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:4200 | Angular app |
| **Backend** | http://localhost:3000 | NestJS API |
| **Swagger** | http://localhost:3000/swagger | API docs |
| **Database** | localhost:5432 | PostgreSQL |
| **Redis** | localhost:6379 | Cache |

## 🧪 Testing Setup

### Frontend Testing

```bash
cd client

# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run e2e tests
pnpm e2e
```

### Backend Testing

```bash
cd server

# Run unit tests
pnpm test

# Run tests with coverage
pnpm test:cov

# Run e2e tests
pnpm test:e2e
```

## 🔧 IDE Configuration

### Trae AI (Recommended)

Trae AI is pre-configured with:
- Angular Language Service
- TypeScript support
- ESLint integration
- Prettier formatting

### VS Code (Alternative)

Recommended extensions:
```json
{
  "recommendations": [
    "angular.ng-template",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

## 🛠️ Development Tools

### Code Quality

```bash
# Lint frontend
cd client
pnpm lint

# Lint backend
cd server
pnpm lint

# Format code
pnpm format
```

### Git Hooks

Git hooks are configured with Husky:

```bash
# Pre-commit: Lint and format
# Pre-push: Run tests
```

### Database Tools

```bash
# Generate migration
cd server
pnpm migration:generate -- src/data/migrations/migration-name

# Run migrations
pnpm migration:run

# Rollback migration
pnpm migration:down
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill process on port 4200
lsof -ti:4200 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

#### Database Connection Issues
```bash
# Reset database
docker-compose -f infrastructure.yaml down -v
docker-compose -f infrastructure.yaml up -d

# Wait for database to be ready
sleep 10
```

#### Node Modules Issues
```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### Docker Issues
```bash
# Clean Docker
docker system prune -a
docker volume prune
```

### Performance Issues

#### Frontend
- Check bundle size: `pnpm nx build client --stats-json`
- Analyze bundle: `pnpm webpack-bundle-analyzer`

#### Backend
- Check memory usage: `pnpm start:dev --inspect`
- Profile performance: Use NestJS profiler

## 📚 Next Steps

1. **Read Architecture**: [../architecture.md](../architecture.md)
2. **Coding Standards**: [./coding-standards.md](./coding-standards.md)
3. **Development Workflow**: [./workflow.md](./workflow.md)
4. **Feature Development**: [../features/](../features/)

## 🆘 Getting Help

- **Documentation**: Check relevant docs in `/docs`
- **Issues**: Create GitHub issue
- **Team Chat**: Slack #my-collection-dev
- **Code Review**: Create Pull Request

---

**Last updated**: $(date)
**Version**: 1.0.0