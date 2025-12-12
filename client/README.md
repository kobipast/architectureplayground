# Client Application

React client application for the Microservices Architecture Playground project.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **TanStack Query (React Query)** - Data fetching and state management

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
client/
├── src/
│   ├── api/          # API client and services
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── services/     # Business logic services
│   ├── utils/        # Utility functions
│   ├── App.jsx       # Main App component
│   └── main.jsx      # Application entry point
├── public/           # Static assets
└── package.json      # Dependencies and scripts
```

## Features

- HTTP client with Axios
- React Query for data fetching and caching
- Resilience patterns (retry, circuit breaker, etc.)
- Proxy configuration for API calls


