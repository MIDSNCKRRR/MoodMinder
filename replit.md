# Overview

This is a mental health and wellness mobile application built with React and Express. The app provides users with tools for emotional tracking, journaling, daily reflections, and crisis support. It features a clean, mobile-first interface with emotion logging, body mapping for physical sensations, and analytics to track emotional patterns over time.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query for server state management and data fetching
- **Design System**: shadcn/ui component library with custom theme using warm, calming colors (peach, sage, lavender, coral)
- **Mobile-First**: Designed as a mobile application with responsive layout and bottom navigation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API endpoints for journal entries, daily reflections, and crisis events
- **Data Storage**: In-memory storage implementation with interface for future database integration
- **Development Setup**: Vite middleware integration for hot reloading in development
- **Error Handling**: Centralized error middleware with proper HTTP status codes

## Data Models
- **Journal Entries**: Emotion level (1-5 scale), emotion type, content, body mapping data, timestamps
- **Daily Reflections**: Question/answer pairs with dates for structured self-reflection
- **Crisis Events**: Timestamped crisis logs with resolution status for emergency tracking
- **Analytics**: Aggregated emotion statistics including averages, streaks, and trends

## Key Features
- **Emotion Tracking**: Visual emotion faces with 5-point scale and body mapping for physical sensations
- **Journaling**: Rich text journaling with emotion correlation and body awareness
- **Analytics Dashboard**: Wave charts showing emotional trends over time with weekly and monthly insights
- **Crisis Support**: Emergency logging system for mental health crisis management
- **Mobile UX**: Touch-optimized interface with bottom navigation and card-based layouts

## Database Integration
- **ORM**: Drizzle ORM configured for PostgreSQL with schema definitions
- **Migrations**: Database migration system using drizzle-kit
- **Connection**: Neon serverless PostgreSQL integration ready for production deployment
- **Schema**: Well-defined tables for journal entries, daily reflections, and crisis events with proper relationships

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, TypeScript for type safety
- **Build Tools**: Vite for fast development and optimized production builds
- **Development Tools**: tsx for TypeScript execution, esbuild for server bundling

## UI and Styling
- **Component Library**: Comprehensive Radix UI primitives for accessible components
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **Animations**: Class Variance Authority for component variants

## Data and State Management
- **Server State**: TanStack React Query for caching, synchronization, and background updates
- **HTTP Client**: Native fetch API with custom wrapper for API requests
- **Form Handling**: React Hook Form with Hookform Resolvers for validation

## Database and Validation
- **Database**: Neon serverless PostgreSQL for production-ready data persistence
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Validation**: Zod for runtime type validation and schema enforcement
- **Session Storage**: connect-pg-simple for PostgreSQL-based session management

## Development and Deployment
- **Type Checking**: TypeScript compiler for static type analysis
- **Development**: Replit-specific plugins for enhanced development experience
- **Runtime**: Node.js with ES modules for modern JavaScript features
- **Package Management**: npm with lock file for reproducible builds