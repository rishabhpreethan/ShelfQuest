# ShelfQuest

Scan shelves → extract titles with Gemini Vision → fetch rich book metadata → get AI recommendations tailored to your preferences. Save lists locally and monetize with Amazon affiliate links.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Gemini API (@google/generative-ai)
- Google Books API (with Open Library fallback)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Copy env and fill keys

```bash
cp .env.example .env.local
```

Set at least:
- `GEMINI_API_KEY=...`
- Optional: `GOOGLE_BOOKS_API_KEY=...` and `AMAZON_AFFILIATE_TAG=yourtag-20`

3. Run dev server

```bash
npm run dev
```

Open http://localhost:3006

## Features (MVP)
- Upload shelf photo and OCR via Gemini Vision (`/api/ocr`)
- Fetch metadata from Google Books with Open Library fallback (`/api/metadata`)
- AI summary + per-book reasons (`/api/recommend`)
- Preferences stored on-device (LocalStorage)
- Simple in-memory rate limiting in API routes

## Project Structure
- `src/app/page.tsx` – Upload → Preferences → Recommend flow
- `src/app/api/*` – OCR, metadata, recommendations
- `src/components/*` – UI components
- `src/lib/*` – Gemini client, APIs, storage utils, types

## Notes
- This MVP avoids a database; lists and prefs are stored locally. Supabase or Edge Config can be added later for sync/caching.
- If Gemini is unavailable, routes gracefully fall back to showing raw titles/metadata.
