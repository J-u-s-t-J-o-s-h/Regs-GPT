# RegsGPT

RegsGPT is an AI-powered web application that helps U.S. Army personnel
quickly search, understand, and reference Army regulations.

This repository is a **clean starting point** — a bare
[Next.js](https://nextjs.org) + TypeScript + Tailwind CSS scaffold with the
RegsGPT landing page. Authentication, AI chat, and subscriptions are
intentionally not included yet, so the project can be rebuilt from a solid,
buildable foundation.

## Tech Stack

- Next.js (Pages Router)
- TypeScript
- Tailwind CSS

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. Edit
`src/pages/index.tsx` and the page will hot-reload.

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — run the production build
- `npm run lint` — run ESLint

## Project Structure

```
src/
  pages/      # Routes: index, _app, _document
  styles/     # Global styles (Tailwind)
public/       # Static assets
```

## Roadmap

The original concept is intact and can be reintroduced incrementally on top
of this foundation:

- AI-powered regulation search and chat
- User authentication
- Subscription / premium access
- Chat history and bookmarks

## License

MIT
