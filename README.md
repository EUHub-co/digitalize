# AI-Ops Studio - Landing Page

A modern, premium landing page for AI-Ops services, built with Next.js 16, TypeScript, and Bun.

## 🚀 Features

- **Multi-language Support**: English and Slovak translations
- **Premium Design**: Dark theme with glassmorphism and neon accents
- **Responsive**: Mobile-first approach
- **SEO Optimized**: Meta tags and semantic HTML
- **Docker Ready**: Containerized for easy deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime**: Bun.js
- **Language**: TypeScript
- **Styling**: CSS Modules
- **Icons**: Lucide React + Custom 3D assets
- **Deployment**: Docker + GCP Artifact Registry

## 📦 Installation

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Setup

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

## 🐳 Docker

### Build locally

```bash
docker build -t ai-studio-app .
```

### Run container

```bash
docker run -p 3000:3000 ai-studio-app
```

## 🔄 CI/CD Pipeline

The project uses GitHub Actions to automatically build and push Docker images to GCP Artifact Registry.

### Setup Required:

1. **Create a GCP Service Account** with the following roles:
   - `Artifact Registry Writer`
   
2. **Download the JSON key** for the service account

3. **Add the JSON key as a GitHub Secret**:
   - Go to repository Settings → Secrets and variables → Actions
   - Create a new secret named `GCP_SA_KEY`
   - Paste the entire JSON key content

4. **Push to main/master branch** to trigger the pipeline

### Image Location

Images are pushed to:
```
europe-west1-docker.pkg.dev/webapp-473913/ai-studio/ai-studio-app:latest
```

## 🌍 Languages

- English (`/en`)
- Slovak (`/sk`)

To add a new language:
1. Create `src/dictionaries/{lang}.json`
2. Update `src/middleware.ts` to include the new locale
3. Update `src/get-dictionary.ts` to load the new dictionary

## 🚚 Related services

The **infrastructure / DevSecOps landing** (formerly the `/infra` route + `infra.euhub-ai.com` host-rewrite in this repo) now lives in its own repo **[`web-dev-studio/euhub-deploy`](https://github.com/web-dev-studio/euhub-deploy)**, deployed as the separate Cloud Run service `euhub-infra-web`. Its canonical host is **`deploy.euhub-ai.com`**. This repo 301/308-redirects `/infra` there. See `docs/superpowers/plans/2026-07-11-split-infra-repo.md` for the full split.

## 📝 License

© 2025 AI-Ops Studio. All rights reserved.
