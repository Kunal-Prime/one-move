# OneMove

## Overview

OneMove is a productivity web application that transforms mental chaos into actionable steps. Users input their unstructured thoughts ("brain dumps"), and the app uses AI to analyze them and return structured output: a core problem statement, what's within their control vs. not, and one specific action to take in the next 60 minutes.

The application follows a full-stack TypeScript architecture with a React frontend and Express backend, using PostgreSQL for persistence and OpenAI for AI-powered analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS variables for theming (dark theme default)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express 5 with TypeScript
- **API Design**: Type-safe API contracts defined in `shared/routes.ts` using Zod schemas
- **Database ORM**: Drizzle ORM with PostgreSQL
- **AI Integration**: OpenAI API via Replit AI Integrations (uses `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables)

### Data Flow
1. User submits brain dump text via POST to `/api/moves`
2. Server validates input with Zod schema
3. OpenAI analyzes the text and returns structured JSON (core problem, control factors, next move)
4. Result is stored in PostgreSQL and returned to client
5. User can mark moves as complete via PATCH to `/api/moves/:id/complete`

### Database Schema
Located in `shared/schema.ts`:
- **moves** table: Stores brain dumps, AI analysis results (core problem, control factors as JSON string, next move), completion status, and timestamps

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn + custom)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route components
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── routes.ts        # API route handlers
│   ├── storage.ts       # Database operations
│   └── db.ts            # Database connection
├── shared/              # Shared types and schemas
│   ├── schema.ts        # Drizzle schema + Zod types
│   └── routes.ts        # API contract definitions
└── migrations/          # Database migrations
```

### Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: Session storage (available but may not be in active use)

### AI Services
- **OpenAI API**: Accessed through Replit AI Integrations
  - Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
  - Model: gpt-5.1 for chat completions with JSON response format
  - Used for analyzing brain dumps and generating structured productivity advice

### Replit Integrations (in `server/replit_integrations/`)
Pre-built modules for common AI tasks:
- **audio/**: Voice chat with speech-to-text and text-to-speech
- **chat/**: Conversation management with message history
- **image/**: Image generation via gpt-image-1
- **batch/**: Rate-limited batch processing utilities

### Frontend Libraries
- **@tanstack/react-query**: Data fetching and caching
- **framer-motion**: Animations
- **lucide-react**: Icons
- **wouter**: Client-side routing
- **Radix UI**: Accessible component primitives