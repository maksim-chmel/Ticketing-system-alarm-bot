# Ticketing-system-alarm-bot

Telegram bot that monitors the database for new support tickets and notifies operators in real time. Part of a four-component platform — see [System Overview](#system-overview) below.

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
PostgreSQL
     │
     └── alarm_bot (this repo) polls every 15s
              │ new ticket found
              ▼
     Operator Telegram group/thread
     receives notification with ticket details
```

---

## How It Works

Every 15 seconds the bot queries the database for tickets that have not yet been sent to the operator group. For each new ticket it sends a formatted message and records the ticket ID in a `SentFeedbacks` table to prevent duplicate notifications.

```
SELECT feedbacks not in SentFeedbacks
  → send to operator chat
  → insert into SentFeedbacks
```

The `SentFeedbacks` table is created automatically on first startup.

---

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
| Database | PostgreSQL (via `pg`) |
| Containerization | Docker / Docker Compose |

---

## Project Structure

```
src/
├── index.ts      # Bot setup and entry point
├── monitor.ts    # Polling loop and notification logic
└── db.ts         # PostgreSQL connection pool
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL with the shared schema (see [ticketing-system-server](https://github.com/maksim-chmel/Ticketing-system-server))
- Telegram bot token and operator group/thread ID

### Environment Variables

Create a `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token
DB_CONNECTION_STRING=postgresql://postgres:yourpassword@localhost:5432/feedbackdb
OPERATOR_CHAT_ID=-1001234567890
THREAD_ID=5
```

`THREAD_ID` is optional — use it if your operator group has topics enabled.

### Run locally

```bash
npm install
npx ts-node src/index.ts
```

### Run with Docker Compose

```bash
docker compose up --build
```
