# Ticketing-system-alarm-bot

Telegram bot that polls the backend API for new support tickets and notifies operators in real time. Part of a four-component platform; see [System Overview](#system-overview) below.

---

## System Overview

This project is one of four components that form a complete ticketing platform:

| Repository | Technology | Role |
|---|---|---|
| [ticketing-system-server](https://github.com/maksim-chmel/Ticketing-system-server) | ASP.NET Core 8 | REST API, business logic, database |
| [ticketing-system-ui](https://github.com/maksim-chmel/Ticketing-system-ui) | React 19 + TypeScript | Admin panel for coordinators |
| [feedback_bot](https://github.com/maksim-chmel/Ticketing-system-feedback-bot) | Node.js + TypeScript | Telegram bot for end users |
| **Ticketing-system-alarm-bot** ← you are here | Node.js + TypeScript | Telegram bot that notifies operators of new tickets |

```
User (Telegram)
     │ creates ticket via feedback_bot
     ▼
REST API
     │
     └── alarm_bot (this repo) polls every 15s
              │ new ticket found
              ▼
     Operator Telegram group/thread
     receives notification with ticket details
```

---

## How It Works

Every 15 seconds the bot queries the backend API for tickets that have not yet been notified to the operator group. For each new ticket it sends a formatted message to the configured Telegram chat or topic.

```
POST /api/operator/unnotified-feedback-pulls
  → send to operator chat
```

## Notification Format

```
🆕 Ticket ID: 42
📱 Phone: +49123456789
👤 Telegram: @username
🕒 17.03.2026, 14:32
💬 The app crashes when I try to login
```

---

## Tech Stack

| | |
|---|---|
| Runtime | Node.js + TypeScript |
| Telegram | Telegraf |
| HTTP client | Axios |
| Containerization | Docker / Docker Compose |

---

## Project Structure

```
src/
├── index.ts      # Bot setup and entry point
├── config.ts     # Environment parsing and defaults
└── monitor.ts    # Polling loop and notification logic
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Running backend API reachable from this bot
- Telegram bot token and operator group/thread ID

### Environment Variables

Create a `.env` file:

```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
OPERATOR_CHAT_ID=-1001234567890
THREAD_ID=5
API_BASE_URL=http://adminpanel-back:8080/api
ENABLE_BROADCAST_POLLING=true
```

`THREAD_ID` is optional — use it if your operator group has topics enabled.
`API_BASE_URL` is optional — if omitted, the default internal Docker URL is used.
`ENABLE_BROADCAST_POLLING` is optional — enable/disable polling for broadcast messages (default: true).

### Run locally

```bash
npm install
npm run dev
```

### Run with Docker Compose

```bash
docker compose up --build
```
