# MOANTAP — Tap-to-Earn Game on Monad

A mobile-first tap-to-earn game built with Next.js 16, featuring real-time PvP battles via WebSocket, wallet authentication, combo mechanics, and bot detection — deployed on the Monad blockchain.

---

Our Contract Address

```0x5144984bb6E57D50baD69CCBd17F78DDe7307304```
```https://testnet.monadvision.com/address/0x5144984bb6E57D50baD69CCBd17F78DDe7307304```

## Architecture Overview

```mermaid
graph TB
    subgraph Frontend ["Frontend (Next.js 16)"]
        A[App Layout]
        A --> B[Home - Tap Game]
        A --> C[Leaderboard]
        A --> D[Profile]
        E[PvP Battle Page]
    end

    subgraph State ["State Management (Zustand)"]
        G[gameStore<br/>score, energy, combo]
        H[userStore<br/>users, coins, wallet]
    end

    subgraph Backend ["Backend"]
        I[WebSocket Server<br/>wsServer.ts]
        J[Matchmaking Queue]
        K[Room Manager<br/>30s battles]
    end

    subgraph Blockchain ["Monad Blockchain"]
        L[Wallet Gate<br/>RainbowKit + Wagmi]
    end

    B --> G
    B --> H
    E --> I
    I --> J
    J --> K
    L --> A
    L --> E
```

## Game Flow

```mermaid
flowchart TD
    START[App Loads] --> LOADING[Loading Screen 2.2s]
    LOADING --> GATE{Wallet Connected?}
    GATE -->|No| CONNECT[Show Connect Wallet]
    GATE -->|Yes| REGISTER[Auto-Register<br/>Random Username]
    REGISTER --> GAME[Home - Tap Game]
    GAME --> TAP[User Taps Character]
    TAP --> ENERGY{Energy > 0?}
    ENERGY -->|Yes| SCORE[+Points based on<br/>state x multiplier]
    ENERGY -->|No| WAIT[Out of Energy<br/>Wait for regen]
    SCORE --> COMBO{Combo >= 10?}
    COMBO -->|Yes| STATE_UP[Idle → Tapping → Charging → Epic]
    COMBO -->|No| IDLE[Stay Idle]
    STATE_UP --> MORE[Tap More]
    IDLE --> MORE
    MORE --> TAP

    GAME --> |Convert| COINS[Points → Coins<br/>Mock Smart Contract]
    GAME --> |PvP| BATTLE[Real-time Battle]
    BATTLE --> WIN{Winner?}
    WIN -->|Yes| REWARD[+1000 Points Reward]
```

## PvP Battle Flow

```mermaid
sequenceDiagram
    participant P1 as Player 1
    participant WS as WebSocket Server
    participant P2 as Player 2

    P1->>WS: JOIN_QUEUE
    P2->>WS: JOIN_QUEUE
    WS->>P1: MATCH_FOUND (slot: A)
    WS->>P2: MATCH_FOUND (slot: B)
    WS->>P1: COUNTDOWN 3
    WS->>P2: COUNTDOWN 3
    WS->>P1: COUNTDOWN 2
    WS->>P2: COUNTDOWN 2
    WS->>P1: COUNTDOWN 1
    WS->>P2: COUNTDOWN 1
    WS->>P1: BATTLE_START
    WS->>P2: BATTLE_START

    loop 30 seconds
        P1->>WS: TAP
        WS->>P2: STATE_UPDATE
        P2->>WS: TAP
        WS->>P1: STATE_UPDATE
    end

    WS->>P1: GAME_END (winner)
    WS->>P2: GAME_END (winner)
```

## State Management

```mermaid
graph LR
    subgraph gameStore ["gameStore (localStorage)"]
        direction TB
        GS[score]
        GE[energy: 0-1000]
        GC[combo]
        GB[botStrikes]
    end

    subgraph userStore ["userStore (localStorage)"]
        direction TB
        UW[wallet → user map]
        UC[coins]
        UT[totalTaps]
        UB[bestScore]
    end

    TAP[User Tap] --> GS
    TAP --> GE
    TAP --> GC
    GC --> GM[multiplier 1x-3x]
    GC --> STATE[moanState<br/>idle → tapping → charging → epic]
    GE -->|+10/min| REGEN[Energy Regen]
    GS -->|Convert| UC
```

## Combo & Scoring System

```mermaid
graph TD
    TAP[Each Tap] --> CHECK{Time since last tap < 800ms?}
    CHECK -->|Yes| INC[Combo + 1]
    CHECK -->|No| RESET[Combo = 1]
    INC --> CALC{Combo Level}

    CALC -->|0-4| IDLE["Idle<br/>+1 point x multiplier"]
    CALC -->|5-9| TAP2["Tapping<br/>+2 points x multiplier"]
    CALC -->|10-24| CHARGE["Charging<br/>+3 points x multiplier"]
    CALC -->|25+| EPIC["Epic<br/>+4 points x multiplier"]

    IDLE --> M{Multiplier}
    TAP2 --> M
    CHARGE --> M
    EPIC --> M
    M -->|combo 5+| X12[1.2x]
    M -->|combo 10+| X15[1.5x]
    M -->|combo 20+| X2[2.0x]
    M -->|combo 30+| X3[3.0x]
```

## Bot Detection System

```mermaid
flowchart TD
    TAP[User Tap] --> RECORD[Record timestamp + x,y position]
    RECORD --> WINDOW[Rolling window of last 20 taps]
    WINDOW --> CV{Coefficient of Variation<br/>of intervals < 0.05?}
    CV -->|Yes| BOT_INTERVAL[Bot: Constant Interval]
    CV -->|No| POS{Avg pairwise distance<br/>between positions < 5px?}
    POS -->|Yes| BOT_POS[Bot: Same Position]
    POS -->|No| HUMAN[Human: Normal behavior]

    BOT_INTERVAL --> STRIKE{Strike count}
    BOT_POS --> STRIKE
    STRIKE -->|1st| WARN[Pause 10s + Warning]
    STRIKE -->|2nd+| PENALTY[Pause 30s + Reset Combo]
```

## Project Structure

```
monad-blitz/
├── src/
│   ├── app/
│   │   ├── (main)/          # Main app routes (with layout)
│   │   │   ├── page.tsx     # Home - Tap game
│   │   │   ├── leaderboard/ # PvP rankings
│   │   │   └── profile/     # User profile
│   │   ├── pvp/             # PvP battle (standalone layout)
│   │   └── layout.tsx       # Root layout
│   ├── components/
│   │   ├── fx/              # Visual effects (beam, particles, shake)
│   │   ├── layout/          # AppHeader, AppLayout, BottomNav, WalletGate
│   │   ├── pvp/             # PvP battle, countdown, matchmaking
│   │   ├── tap/             # MoanTap character
│   │   └── ui/              # Base UI (shadcn)
│   ├── config/              # RainbowKit + Wagmi config
│   ├── constants/           # Smart contract ABIs
│   ├── contexts/            # UserContext (wallet → user)
│   ├── hooks/               # useTapGame, usePvPSocket, useBotDetection
│   ├── lib/                 # tapLogic, wsClient, battleLogic, usernameGenerator
│   ├── stores/              # Zustand: gameStore, userStore
│   ├── styles/              # Design tokens (colors, gradients, spacing)
│   └── types/               # TypeScript: user, tap, pvp
├── server/                  # WebSocket server
│   ├── wsServer.ts          # Main WS server
│   ├── matchmaking.ts       # Queue + match logic
│   └── roomManager.ts       # Battle room lifecycle
├── packages/
│   └── smart-contracts/     # Solidity contracts (Foundry)
├── public/assets/           # Images, character sprites, backgrounds
└── railway.json             # Railway WS deploy config
```

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router, Webpack) |
| Language | TypeScript |
| UI | React 19, Tailwind CSS, Framer Motion |
| State | Zustand v5 (localStorage persist) |
| Wallet | RainbowKit 2.x + Wagmi 2.x + Viem 2.x |
| Blockchain | Monad |
| Real-time | WebSocket (ws) |
| Smart Contracts | Solidity + Foundry |
| Design | Custom design tokens, mobile-first |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
git clone https://github.com/kikik27/monad-blitz.git
cd monad-blitz
npm install
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Run

```bash
# Start frontend
npm run dev

# Start WebSocket server (separate terminal)
npm run server:ws
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Deployment

### Frontend → Vercel

```bash
npx vercel
```

Set environment variable in Vercel dashboard:
- `NEXT_PUBLIC_WS_URL` = your WebSocket server URL

### WebSocket Server → Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

Railway auto-assigns `PORT` and provides a public `wss://` URL.

## Features

- **Tap-to-Earn** — Tap the character to earn points, combo multipliers up to 3x
- **4 Character States** — Idle, Tapping, Charging, Epic (visual + scoring changes)
- **Energy System** — 1000 max, -1 per tap, +10 regen per minute
- **Convert Points → Coins** — Mock smart contract interaction
- **Real-time PvP** — 30-second battles via WebSocket, winner gets +1000 points
- **Wallet Gate** — Must connect wallet (RainbowKit) to play
- **Auto Username** — Indonesian-themed random names (e.g. KucingTidur482)
- **Bot Detection** — Constant interval + same position detection with penalties
- **Mobile-first UI** — Bottom nav, underwater background, responsive layout
- **Persistent State** — Score, energy, coins, user data survive page reloads

## License

MIT
