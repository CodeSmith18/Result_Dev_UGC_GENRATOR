import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from "remotion";

export function UGCVideo({ productBrief, preferences, recipe, assets }) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const seconds = frame / fps;
  const activeScene =
    recipe.scenes.find((scene) => seconds >= scene.start && seconds < scene.end) ||
    recipe.scenes[recipe.scenes.length - 1];
  const progress = frame / durationInFrames;
  const palette = assets.background.palette || ["#171717", "#0f766e", "#e05263"];
  const scale = interpolate(frame, [0, durationInFrames], [1.05, 1.22]);
  const textY = interpolate(frame % 72, [0, 12, 72], [42, 0, 0]);
  const stickerScale = interpolate(frame % 44, [0, 12, 28, 44], [0.92, 1.08, 1, 0.96]);
  const stickerRotate = interpolate(frame % 60, [0, 30, 60], [-4, 5, -4]);

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
        {assets.background.url ? (
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
            "linear-gradient(180deg, rgba(0,0,0,0.22), rgba(0,0,0,0.12) 38%, rgba(0,0,0,0.78))"
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 96,
          left: 72,
          right: 72,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 28,
          fontWeight: 900,
          letterSpacing: 0,
          textTransform: "uppercase",
          fontSize: 34
        }}
      >
        <span
          style={{
            padding: "18px 22px",
            borderRadius: 22,
            background: "rgba(255,255,255,0.92)",
            color: "#111827"
          }}
        >
          {productBrief.productName}
        </span>
        <span
          style={{
            padding: "18px 22px",
            borderRadius: 22,
            background: palette[2],
            color: "#111827"
          }}
        >
          {preferences.goal}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 322,
          transform: `translateY(${textY}px)`,
          textShadow: "0 8px 34px rgba(0,0,0,0.45)"
        }}
      >
        <div
          style={{
            display: "inline-block",
            marginBottom: 26,
            padding: "14px 22px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.92)",
            color: "#111827",
            fontSize: 34,
            fontWeight: 900,
            textTransform: "uppercase"
          }}
        >
          {recipe.audioMood}
        </div>
        <div
          style={{
            fontSize: activeScene.text.length > 42 ? 78 : 90,
            lineHeight: 0.98,
            fontWeight: 1000,
            letterSpacing: 0
          }}
        >
          {activeScene.text}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: 74,
          bottom: 640,
          width: 330,
          minHeight: 260,
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
              width: 330,
              height: 260,
              objectFit: "cover",
              borderRadius: 34,
              border: "10px solid white",
              boxShadow: "0 22px 60px rgba(0,0,0,0.34)"
            }}
          />
        ) : (
          <div
            style={{
              width: 330,
              minHeight: 260,
              display: "grid",
              placeItems: "center",
              padding: 26,
              borderRadius: 38,
              border: "10px solid white",
              background: palette[2],
              color: "#111827",
              boxShadow: "0 22px 60px rgba(0,0,0,0.34)",
              textAlign: "center",
              fontSize: 62,
              lineHeight: 0.92,
              fontWeight: 1000,
              textTransform: "uppercase"
            }}
          >
            {assets.gif.label}
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 92,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 28
        }}
      >
        <div
          style={{
            maxWidth: 610,
            color: "rgba(255,255,255,0.86)",
            fontSize: 31,
            lineHeight: 1.22,
            fontWeight: 760
          }}
        >
          {productBrief.mainBenefit}
        </div>
        <div
          style={{
            flex: "0 0 auto",
            padding: "24px 30px",
            borderRadius: 24,
            background: "white",
            color: "#111827",
            fontSize: 38,
            fontWeight: 1000,
            textTransform: "uppercase",
            boxShadow: "0 18px 50px rgba(0,0,0,0.26)"
          }}
        >
          {recipe.cta}
        </div>
      </div>
    </AbsoluteFill>
  );
}
