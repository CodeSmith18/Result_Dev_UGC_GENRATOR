import React from "react";
import { Composition } from "remotion";
import { UGCVideo } from "./UGCVideo";

const defaultProps = {
  productBrief: {
    productName: "Product",
    category: "consumer product",
    targetAudience: "busy people",
    painPoint: "the old way takes too long",
    mainBenefit: "makes the job easier",
    tone: "modern",
    cta: "Try it now",
    sourceUrl: "https://example.com"
  },
  preferences: {
    tone: "funny",
    audience: "Gen Z",
    goal: "clicks",
    extraInstructions: []
  },
  recipe: {
    duration: 6,
    format: "vertical",
    funnyText: "me when the annoying part finally handles itself",
    gifQuery: "shocked reaction sticker",
    backgroundQuery: "product lifestyle vertical video",
    audioMood: "funny fast upbeat",
    whyThisWorks: "It turns a familiar pain point into a quick payoff."
  },
  assets: {
    background: {
      type: "generated",
      url: "",
      palette: ["#171717", "#0f766e", "#e05263"]
    },
    gif: {
      type: "sticker",
      url: "",
      label: "wait what"
    },
    audio: {
      mood: "funny fast upbeat",
      path: "audio/generated-beat.wav"
    }
  }
};

export function RemotionRoot() {
  return (
    <Composition
      id="UGCVideo"
      component={UGCVideo}
      durationInFrames={144}
      fps={24}
      width={720}
      height={1280}
      defaultProps={defaultProps}
    />
  );
}
