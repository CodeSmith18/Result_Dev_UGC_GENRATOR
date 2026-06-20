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
    duration: 8,
    format: "vertical",
    hook: "POV: the old way takes too long",
    scenes: [
      {
        start: 0,
        end: 2.4,
        text: "POV: the old way takes too long",
        visual: "pain point",
        gifQuery: "shocked reaction"
      },
      {
        start: 2.4,
        end: 5.3,
        text: "This fixes the annoying part",
        visual: "product benefit",
        gifQuery: "mind blown reaction"
      },
      {
        start: 5.3,
        end: 8,
        text: "Try it now",
        visual: "cta",
        gifQuery: "happy reaction"
      }
    ],
    backgroundQuery: "product lifestyle",
    audioMood: "funny fast upbeat",
    cta: "Try it now",
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
      durationInFrames={240}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
}
