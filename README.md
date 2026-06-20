# Result Dev UGC Generator

A conversational Next.js MVP, written in plain JavaScript, that turns any
product URL into a short UGC-style video.

## Goal

The app should behave like a lightweight creative assistant:

1. Chat naturally with the user.
2. Detect when a message includes a product URL.
3. Analyze the product website.
4. Ask a few tone/audience/goal questions in chat.
5. Generate a short UGC video concept.
6. Assemble a 5-10 second vertical video.
7. Return the final video URL in the chat.

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Then open `http://localhost:3000`.

## Environment

Required once AI analysis is wired:

```bash
ANTHROPIC_API_KEY=
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Optional later:

```bash
GIPHY_API_KEY=
PEXELS_API_KEY=
```

The MVP is designed to use local fallback assets so video generation can still
work without optional media-provider keys.
