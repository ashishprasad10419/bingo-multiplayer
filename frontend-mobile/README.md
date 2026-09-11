# Bingo Multiplayer - Mobile App (Flutter)

A native mobile client for Bingo Multiplayer built with **Flutter 3**, targeting both **iOS** and **Android**.

---

## Features
- **3D Pastel Claymorphic UI**: Styled to match the web PWA design (Plus Jakarta Sans, coral-rose gradient CTA buttons, soft pastel stat cards, and diffuse lilac shadows).
- **0ms Optimistic Picking**: Visual pick confirmation (emerald glow, checkmark, banner status) happens instantaneously without waiting for network round-trips.
- **Dual-Channel Delivery**: Real-time STOMP over WebSockets (`stomp_dart_client`) with 350ms REST safety fallback.
- **In-Game Reactions**: Floating real-time emoji reactions (👏, 🔥, 🎯, 😂, 😮, 🥳) synchronized with all room participants.
- **Dynamic Board Customization**: Supports 5x5 up to 10x10 boards with interactive tap-to-swap and shuffle mechanics.

---

## Project Structure
```
frontend-mobile/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── api/api_client.dart          # Dio REST client with JWT interceptor
│   │   ├── socket/stomp_socket_service.dart # STOMP WebSocket client
│   │   ├── constants/api_constants.dart # Render cloud backend URLs
│   │   └── theme/clay_theme.dart        # 3D pastel clay design tokens
│   ├── models/
│   │   ├── user.dart                    # User profile & stats
│   │   ├── room.dart                    # Room & connected players
│   │   └── game.dart                    # Live game & move records
│   ├── providers/
│   │   ├── auth_provider.dart           # Authentication & session state
│   │   └── game_provider.dart           # Live match state & 0ms picks
│   ├── widgets/
│   │   ├── clay_button.dart             # Pill buttons (gradient & outline)
│   │   ├── clay_card.dart               # Elevated rounded clay card
│   │   ├── board_grid_widget.dart       # Interactive multi-size Bingo board
│   │   ├── emote_picker_widget.dart     # In-game reaction tray
│   │   └── floating_emotes_view.dart    # Floating animated reaction overlay
│   └── screens/
│       ├── splash_screen.dart           # Auto-login & branded splash
│       ├── login_screen.dart            # Login & guest play
│       ├── home_screen.dart             # Dashboard with 4 pastel stat cards
│       ├── create_room_screen.dart      # Custom board size & rules setup
│       ├── join_room_screen.dart        # 6-letter room code entry
│       ├── lobby_screen.dart            # Connected players & start game
│       ├── board_setup_screen.dart      # Custom board number rearrangement
│       ├── game_screen.dart             # Core live arena with 0ms picks & emotes
│       ├── winner_screen.dart           # Victory celebration screen
│       └── leaderboard_screen.dart      # Global player rankings
└── pubspec.yaml
```

---

## Getting Started

### 1. Prerequisites
- [Flutter SDK](https://flutter.dev/docs/get-started/install) (3.0+)
- Android Studio / Xcode (for simulators or device testing)

### 2. Install Dependencies
```bash
cd frontend-mobile
flutter pub get
```

### 3. Run on Simulator / Device
```bash
flutter run
```
The app will connect to the production cloud backend hosted on Render (`https://bingo-multiplayer-kqtx.onrender.com`).
