import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

export function UGCVideo({ productBrief, preferences, recipe, assets }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;
  const palette = assets.background.palette || ["#171717", "#0f766e", "#e05263"];
  const scale = interpolate(frame, [0, durationInFrames], [1.02, 1.12]);
  const caption = recipe.funnyText || "me when the product handles it";
  const captionFontSize = caption.length > 74 ? 43 : caption.length > 52 ? 49 : 56;
  const stickerScale = interpolate(frame % 52, [0, 14, 30, 52], [1.18, 1.28, 1.23, 1.2]);
  const stickerRotate = interpolate(frame % 84, [0, 42, 84], [-1.5, 1.5, -1.5]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: palette[0],
        color: "white",
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        overflow: "hidden"
      }}
    >
      <Audio src={staticFile(assets.audio.path)} volume={0.55} />

      <AbsoluteFill>
        {assets.background.type === "video" && assets.background.url ? (
          <OffthreadVideo
            src={assets.background.url}
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale})`
            }}
          />
        ) : assets.background.url ? (
          <Img
            src={assets.background.url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: `scale(${scale}) translateY(${interpolate(progress, [0, 1], [0, -36])}px)`,
              filter: "saturate(1.1) contrast(1.05)"
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(145deg, ${palette[0]}, ${palette[1]} 48%, ${palette[2]})`,
              transform: `scale(${scale})`
            }}
          />
        )}
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.34), rgba(0,0,0,0.04) 44%, rgba(0,0,0,0.28))"
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 142,
          left: 78,
          right: 78,
          textAlign: "center",
          color: "white",
          fontSize: captionFontSize,
          lineHeight: 1.09,
          fontWeight: 900,
          letterSpacing: 0,
          textShadow:
            "0 4px 0 #000, 3px 0 0 #000, -3px 0 0 #000, 0 -3px 0 #000, 0 8px 22px rgba(0,0,0,0.55)"
        }}
      >
        {caption}
      </div>

      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 42,
          height: 980,
          transform: `scale(${stickerScale}) rotate(${stickerRotate}deg)`,
          transformOrigin: "center",
          display: "grid",
          placeItems: "center"
        }}
      >
        {assets.gif.url ? (
          <Img
            src={assets.gif.url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: "drop-shadow(0 28px 34px rgba(0,0,0,0.45))"
            }}
          />
        ) : (
          <div
            style={{
              width: 560,
              minHeight: 420,
              display: "grid",
              placeItems: "center",
              padding: 34,
              borderRadius: 44,
              border: "12px solid white",
              background: palette[2],
              color: "#111827",
              boxShadow: "0 22px 60px rgba(0,0,0,0.34)",
              textAlign: "center",
              fontSize: 88,
              lineHeight: 0.92,
              fontWeight: 1000,
              textTransform: "uppercase"
            }}
          >
            {assets.gif.label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
