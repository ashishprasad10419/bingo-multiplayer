# Bingo Multiplayer Game — Full System Design

**Strategy:** Build a PWA (web) first → validate with real users → build Flutter mobile
app reusing the same backend → submit to app stores once proven.

This document is meant to be complete enough to hand to a developer (or an AI coding
agent) and start building without needing to ask clarifying questions about the core
architecture. Game rule specifics (max players, win-line count, turn order) are stated
explicitly below as assumptions — change them if your actual rules differ, since they
affect the data model.

---

## Table of Contents

1. Assumptions / game rules locked for this design
2. Tech stack
3. High-level architecture
4. Monorepo folder structure
5. Backend package structure (Spring Boot)
6. Database design (MongoDB Atlas) — full collection schemas
7. Authentication (dual: cookie for web, Bearer token for mobile)
8. CORS configuration
9. REST API — full endpoint list with request/response shapes
10. WebSocket / STOMP — full event catalog with payloads
11. Core game logic (board generation, locking, turns, line detection, winner)
12. Application flow (screen-by-screen)
13. PWA-specific implementation details
14. Anti-cheat / server-authority principle
15. Disconnect / reconnect handling
16. Badge & leaderboard system
17. Deployment plan (Render / Vercel / MongoDB Atlas)
18. Phased build roadmap
19. Explicit non-goals for MVP
20. Open decisions you still need to make

---

## 1. Assumptions / game rules locked for this design

| Rule | Default assumption |
|---|---|
| Max players per room | 6 |
| Board size | 5×5 (numbers 1–25) |
| Winning condition | 5 completed lines (rows + columns + both diagonals = 12 possible lines, first to complete 5 of them wins) |
| Who calls numbers | Turn-based, rotating player order (not random/server-selected) |
| Guest play allowed | Yes, no forced account creation |
| Room password | Optional, off by default |

---

## 2. Tech stack

| Layer | Technology | Notes |
|---|---|---|
| Web frontend (PWA) | React + Vite | Built first. Vite over Next.js since there's no SSR/SEO need for a logged-in real-time game. |
| Mobile frontend | Flutter (Dart) | Built second, after PWA is validated. Same backend, no changes needed. |
| Backend | Spring Boot (Java) | Single monolith. No microservices for MVP. |
| Real-time protocol | WebSocket + STOMP | Same protocol serves both web (via SockJS/stompjs) and mobile (via web_socket_channel/stomp_dart_client) clients. |
| Database | MongoDB Atlas | Managed, cloud-hosted — no server to maintain. |
| Auth | JWT | httpOnly cookie for web, Bearer header for mobile. |
| Backend hosting | Render | Supports long-lived WebSocket connections on web services. |
| Web hosting | Vercel | Hosts the actual playable PWA, not just a landing page. |
| Push notifications | Firebase Cloud Messaging | Mobile-native first. |
| API docs | springdoc-openapi (Swagger UI) | Interactive docs for API exploration. |
| Containerization | Docker | Docker Compose locally. |

---

## 3. High-level architecture

```
┌─────────────────────────┐        ┌──────────────────────────┐
│   frontend-web (PWA)     │        │  frontend-mobile (Flutter)│
│   React + Vite            │        │  Android + iOS            │
│   hosted on Vercel        │        │  (Phase 3)                │
└────────────┬─────────────┘        └─────────────┬─────────────┘
             │                                      │
       HTTPS + WSS (CORS-restricted)          HTTPS + WSS
             │                                      │
             └──────────────────┬───────────────────┘
                                 ▼
                    ┌────────────────────────────┐
                    │      Spring Boot Backend     │
                    │        (hosted on Render)    │
                    ├────────────────────────────┤
                    │ Auth Service                 │
                    │ User Service                  │
                    │ Room Manager                  │
                    │ Board Generator/Validator      │
                    │ Game Engine                    │
                    │  ├─ Turn Manager                │
                    │  ├─ Number Validator             │
                    │  ├─ Line Calculator                │
                    │  └─ Winner Detector                 │
                    │ Badge Service                        │
                    │ Leaderboard Service                    │
                    │ WebSocket/STOMP Controller               │
                    └───────────────┬────────────────────────┘
                                    │ MongoDB Driver
                                    ▼
                    ┌────────────────────────────┐
                    │        MongoDB Atlas         │
                    │  users, rooms, games,        │
                    │  badges, user_badges,        │
                    │  game_history                │
                    └────────────────────────────┘
```

Core principle:
Client: "I want to do X" → Server validates → MongoDB saves authoritative state → WebSocket broadcasts result.
Neither frontend is ever trusted for game truth.
