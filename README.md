# Bingo Multiplayer Game

A real-time multiplayer Bingo game with an authoritative Spring Boot backend, a modern React/Vite PWA web frontend, and future Flutter mobile frontend.

## Architecture & Tech Stack

- **Backend:** Spring Boot 3.x (Java 21), Spring Security, Spring WebSocket (STOMP), Spring Data MongoDB, springdoc-openapi.
- **Frontend (Web PWA):** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Axios, `@stomp/stompjs`, SockJS.
- **Database:** MongoDB (Local / Atlas).
- **Real-time Protocol:** STOMP over WebSocket.
- **Authentication:** Dual-mode JWT (httpOnly cookies for Web, Bearer Authorization header for mobile/API).

## Project Structure

```
.
├── backend/            # Spring Boot backend application
├── frontend-web/       # React + Vite PWA frontend
├── frontend-mobile/    # Flutter mobile app (Phase 3)
├── docs/               # System architecture & design specs
└── README.md
```

## Getting Started

### Prerequisites
- Java 21+ & Maven 3.9+ (or Docker)
- Node.js 20+ & npm
- MongoDB 7+ (local or Atlas connection string)

### Running Locally

1. **MongoDB**:
   Ensure MongoDB is running locally on port 27017, or set `MONGODB_URI` environment variable.

2. **Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   API docs available at: `http://localhost:8080/swagger-ui.html`

3. **Web Frontend (PWA)**:
   ```bash
   cd frontend-web
   npm install
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.
