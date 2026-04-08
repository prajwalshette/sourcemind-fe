# SourceMind - Universal Knowledge Engine

SourceMind is an AI-powered platform designed to unify scattered intelligence. It allows you to connect websites, documents, videos, and codebases into a single semantic brain that answers your questions instantly using Retrieval Augmented Generation (RAG).

## 🚀 Key Features

- **🌐 Multi-Source Ingestion**: Effortlessly index content from public URLs, articles, and blogs.
- **📄 Document Analysis** (Coming Soon): Upload and query PDFs, Word docs, and plain text files.
- **🎥 YouTube Intelligence** (Coming Soon): Semantic search and transcript extraction from video links.
- **💻 Codebase Indexing** (Coming Soon): Deep technical querying for GitHub repositories.
- **🔒 Private & Secure**: Built with multi-tenant architecture to ensure data isolation and security.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd url-rag-fe
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:
   Copy the example environment file and update the variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to set your `VITE_APP_BASE_URL`.

4. **Start the development server**:
   ```bash
   pnpm run dev
   ```

## 🏗️ Project Structure

- `src/pages`: Application views (Home, Dashboard, Chat, etc.)
- `src/components`: Reusable UI components powered by shadcn/ui.
- `src/services`: API integration and external service logic.
- `src/hooks`: Custom React hooks for shared logic.
- `src/lib`: Utility functions and configuration.

## 🧪 Development

- **Linting**: `pnpm run lint`
- **Formatting**: `pnpm run format`
- **Type Checking**: `pnpm run typecheck`

---

Built for multi-source intelligence ingestion and retrieval.
