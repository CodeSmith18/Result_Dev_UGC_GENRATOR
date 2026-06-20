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
ANTHROPIC_MODEL=claude-sonnet-4-6
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Optional later:

```bash
GIPHY_API_KEY=
PEXELS_API_KEY=
```

The MVP is designed to use local fallback assets so video generation can still
work without optional media-provider keys.

## Current Flow

- Natural chat replies are handled by `/api/chat`.
- URL messages are scraped server-side and turned into a product brief.
- If `ANTHROPIC_API_KEY` is present, Claude improves product understanding and
  preference parsing.
- If the key is missing, deterministic fallback logic keeps the demo moving.
- The assistant asks tone, audience, and conversion-goal questions in chat before
  video generation.
- The vibe check is clickable: users choose tone, audience, and goal from option
  chips, then generate without manually typing preferences.
- After preferences are collected, the app creates a UGC recipe, chooses assets,
  renders an MP4 with Remotion, saves it in `public/renders`, and returns the
  video URL in chat.
- The rendered video intentionally uses a meme-only format inspired by the
  assignment examples: one vertical background clip, one funny text caption, one
  large reaction GIF/sticker, and audio. It avoids product badges, CTA cards, and
  extra descriptive text inside the video.
- Meme generation uses product-specific joke hints and trend templates so
  captions feel more like TikTok/Reels comments than generic ad copy.
- Asset selection randomizes from top Giphy/Pexels results, tracks recent GIF and
  background URLs in chat context, and avoids reusing the same assets across
  revisions.
- Giphy lookups now prefer short viral human meme searches and reject common
  logo/icon/emoji/text/cartoon results so overlays feel like real reaction memes.
- After a video is generated, the user can ask for another version in chat, such
  as "make it funnier" or "try a more premium version."
- If website scraping fails, the assistant asks for a one-line product
  description and continues the same flow.

## Optional Asset Keys

The MVP works without these, but output improves when they are present:

- `GIPHY_API_KEY` enables real reaction GIF overlays.
- `PEXELS_API_KEY` enables stock-photo background selection.

Without those keys, the app uses the product website Open Graph image when
available, a generated visual background otherwise, and an animated sticker
fallback for the GIF layer.
