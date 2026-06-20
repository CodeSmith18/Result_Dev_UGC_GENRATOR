# Result Dev UGC Generator

A conversational Next.js MVP, written in plain JavaScript, that turns any product
URL into a short meme-style UGC video.

The app is not trying to generate video from scratch. It is AI-organized:
it reads a product website, understands the positioning, chooses a funny angle,
picks real media assets, renders them together, and returns a final MP4 URL in
the same chat.

## What It Does

1. User chats naturally with the app.
2. If the user says "hi" or asks what it can do, the assistant responds normally.
3. If the user sends a product URL, the server scrapes and analyzes the website.
4. The app creates a product brief: product name, category, audience, pain point,
   main benefit, and CTA.
5. The chat shows clickable tone, audience, and goal options.
6. Those options are generated from the website, so a fitness app gets macro
   jokes, a travel app gets trip-planning jokes, and a SaaS app gets spreadsheet
   jokes.
7. After the user clicks options, the app creates a short UGC video recipe.
8. The app picks a background from Pexels, a real human meme/reaction GIF from
   Giphy, a funny text caption, and a generated beat.
9. Remotion renders a vertical MP4 and the assistant returns the video URL.

## Demo Flow

Example prompt:

```text
I'm building CalAI, a calorie-tracking app. Here's the site: https://www.calai.app/
```

The assistant responds with a product summary and website-specific choices like:

```text
Tone: Roast my macro math
Audience: macro guessers in denial
Goal: Expose manual logging
```

After the user clicks `Generate meme video`, the chat returns:

```text
Done. Here's your meme video.

Text: not me calling calories a vibe check
Video URL: /renders/ugc-...mp4
```

## Example Sites To Try

- Fitness/calorie: `https://www.calai.app/`
- SaaS/workflow: `https://linear.app/`
- Productivity: `https://www.notion.com/`
- Finance/budgeting: `https://www.ynab.com/`
- Beauty/skincare: `https://www.glossier.com/`
- Education: `https://www.duolingo.com/`
- Travel: `https://www.airbnb.com/`
- Creator/video: `https://www.capcut.com/`
- Ecommerce: `https://www.warbyparker.com/`

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Start the app:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

Build check:

```bash
pnpm build
```

## Environment Variables

Required for best AI behavior:

```bash
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=claude-sonnet-4-6
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Optional but recommended for better media assets:

```bash
GIPHY_API_KEY=
PEXELS_API_KEY=
```

If the optional media keys are missing, the app still works with fallback visual
assets. If the Anthropic key is missing, deterministic fallback logic keeps the
demo moving, but the product understanding and captions are less creative.

## Video Format

The rendered video follows the assignment's UGC-style structure:

- One vertical background video or image.
- One short funny caption.
- One large but controlled human meme GIF/reaction overlay.
- One upbeat audio layer.

Current render settings are optimized for fast demos:

- Duration: 6 seconds.
- Size: 720x1280.
- FPS: 24.
- Output: `public/renders/*.mp4`.
- Public URL: `/renders/<video-id>.mp4`.

## Architecture

```text
app/api/chat/route.js
  Receives chat messages and returns assistant replies.

lib/chatFlow.js
  Main conversation state machine.
  Handles greeting, URL detection, product analysis, preference collection,
  video generation, and revisions.

lib/productAnalyzer.js
  Scrapes a product website and turns it into a product brief.
  Uses Claude when available and fallback heuristics otherwise.

lib/preferenceOptions.js
  Creates sarcastic, website-specific clickable tone/audience/goal chips.

lib/preferenceParser.js
  Parses clicked chip choices.
  Structured chip messages skip an extra AI parsing call for speed.

lib/videoRecipe.js
  Creates the meme video recipe: caption, GIF query, background query,
  audio mood, and reasoning.

lib/assetPicker.js
  Picks media assets.
  Uses Giphy for real human meme GIFs and Pexels for vertical backgrounds.

lib/renderVideo.js
  Bundles and renders the Remotion composition into an MP4.

remotion/UGCVideo.jsx
  Defines the final visual layout: background, caption, GIF overlay, audio.
```

## Speed Optimizations

Generation is optimized for the demo loop:

- URL analysis is cached in memory.
- Video recipes are cached by product and selected preferences.
- Giphy and Pexels results are cached in memory.
- Likely media assets start prewarming while the user is choosing options.
- The Remotion bundle starts prewarming before the user clicks generate.
- Giphy and Pexels lookup run in parallel.
- Clicked chip preferences skip an extra Claude parsing step.
- The Remotion bundle is reused instead of rebuilt for every render.
- The render target is 6 seconds at 720x1280 and 24fps.

## Meme Quality Rules

The video generator is intentionally meme-first:

- Captions should feel like TikTok/Reels comments, not generic ad copy.
- GIFs should be real human reaction memes, not logos, icons, emoji, cartoons,
  anime, animals, text-only stickers, or abstract sticker packs.
- Asset history is tracked in chat context to avoid repeating the same GIF or
  background in revisions.
- Users can ask for another version after a video is generated, for example:
  `make it funnier`, `try a more premium version`, or `change the GIF`.

## Troubleshooting

If a video render fails:

1. Confirm the dev server is running on `http://localhost:3000`.
2. Check `.next/dev/logs/next-development.log`.
3. Delete `.remotion-cache` if Remotion cache state looks stale.
4. Run `pnpm build` to catch import or render errors.

If media looks weak:

1. Make sure `GIPHY_API_KEY` and `PEXELS_API_KEY` are set.
2. Try a product URL with clear website copy.
3. Ask for a revision in chat, such as `make it funnier` or `try a different GIF`.

## Tech Stack

- Next.js App Router
- React
- Plain JavaScript
- Anthropic Claude
- Cheerio
- Giphy API
- Pexels API
- Remotion
