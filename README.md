# AI Receptionist MVP — Auto Repair Shops

Demo landing page with live AI chat for **Mike's Auto Repair**. Built to show shop owners and close first sales.

## Features

- **Talk to the AI Receptionist** — support-style chat (NVIDIA Nemotron)
- Answers services, pricing, hours, appointment booking
- Collects appointment leads (name, phone, vehicle, service; email optional) → **Resend email**
- **Get Your Own AI Receptionist** contact form → demo requests via Resend

## Quick start

```bash
cd Mechanics
npm install
cp .env.example .env.local
# Add NVIDIA_API_KEY (required) and RESEND_API_KEY (optional, for emails)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NVIDIA_API_KEY` | Yes | Powers `/api/chat` (server only) |
| `NVIDIA_MODEL` | No | Default `deepseek-ai/deepseek-v4-flash` |
| `RESEND_API_KEY` | For email | Sends leads to owner |
| `OWNER_EMAIL` | For email | Where leads arrive |
| `FROM_EMAIL` | For email | Verified sender in Resend |

Without Resend, chat still works; leads are logged to the server console.

## API routes

- `POST /api/chat` — AI receptionist conversation + appointment submission
- `POST /api/demo` — Shop owner demo request form

## Deploy

Works on Vercel, Railway, etc. Set env vars in the host dashboard.
