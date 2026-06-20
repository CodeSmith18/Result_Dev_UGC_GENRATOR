import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { ensureGeneratedBeat } from "@/lib/audio";

const compositionId = "UGCVideo";

export async function renderUgcVideo({ productBrief, preferences, recipe, assets }) {
  const rootDir = process.cwd();
  const publicDir = path.join(rootDir, "public");
  const rendersDir = path.join(publicDir, "renders");
  const bundleDir = path.join(rootDir, ".remotion-cache");
  const videoId = `ugc-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const outputLocation = path.join(rendersDir, `${videoId}.mp4`);

  mkdirSync(rendersDir, { recursive: true });
  mkdirSync(bundleDir, { recursive: true });
  ensureGeneratedBeat(publicDir);

  const inputProps = {
    productBrief,
    preferences,
    recipe,
    assets
  };

  const serveUrl = await bundle({
    entryPoint: path.join(rootDir, "remotion", "index.jsx"),
    outDir: path.join(bundleDir, "bundle"),
    publicDir,
    rootDir,
    enableCaching: true,
    symlinkPublicDir: true,
    onProgress: () => {}
  });

  const browserExecutable = findLocalChrome();
  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps,
    browserExecutable,
    timeoutInMilliseconds: 120000,
    logLevel: "warn"
  });

  await renderMedia({
    serveUrl,
    composition,
    inputProps,
    codec: "h264",
    outputLocation,
    overwrite: true,
    browserExecutable,
    timeoutInMilliseconds: 120000,
    chromiumOptions: {
      disableWebSecurity: true,
      ignoreCertificateErrors: true
    },
    concurrency: 1,
    logLevel: "warn"
  });

  return {
    videoId,
    videoPath: outputLocation,
    videoUrl: `/renders/${videoId}.mp4`
  };
}

function findLocalChrome() {
  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
  ];

  return candidates.find((candidate) => existsSync(candidate)) || undefined;
}
