export const memeTemplates = [
  "me pretending {pain_point} is totally fine",
  "{product} watching me struggle with {old_way}",
  "POV: {product} just exposed my whole routine",
  "me after realizing {benefit}",
  "the old way vs me after finding {product}",
  "when {product} does the thing I avoided for months",
  "me acting normal after {product} solved it in seconds",
  "not me using {product} and calling it discipline",
  "be so real, {old_way} was never working",
  "silent repost if {pain_point} is your villain origin story"
];

export const trendStyles = [
  "delulu confession",
  "silent repost energy",
  "be so for real",
  "main character spiral",
  "brain rot but useful",
  "POV self-roast",
  "group chat confession",
  "caught in 4K",
  "this is my personality now",
  "low-effort genius"
];

export function productMemeHints(productBrief) {
  const text = [
    productBrief.productName,
    productBrief.category,
    productBrief.painPoint,
    productBrief.mainBenefit
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("calorie") || text.includes("macro") || text.includes("fitness")) {
    return {
      oldWay: "guessing calories like it is a personality test",
      backgroundQuery: "person photographing food at restaurant vertical video",
      gifQuery: "kevin hart reaction",
      jokeAngles: [
        "calling a huge meal a snack",
        "getting humbled by the calorie count",
        "pretending macros are vibes-based"
      ]
    };
  }

  if (text.includes("skin") || text.includes("beauty") || text.includes("serum")) {
    return {
      oldWay: "staring in the mirror waiting for a glow up",
      backgroundQuery: "skincare mirror routine vertical video",
      gifQuery: "keke palmer reaction",
      jokeAngles: [
        "skin choosing drama before class",
        "acting like one serum fixed the plot",
        "the mirror becoming brutally honest"
      ]
    };
  }

  if (text.includes("job") || text.includes("career") || text.includes("linkedin")) {
    return {
      oldWay: "refreshing job posts like it is a slot machine",
      backgroundQuery: "person typing laptop job search vertical video",
      gifQuery: "michael scott no",
      jokeAngles: [
        "open to work becoming a personality",
        "recruiter notifications feeling like jump scares",
        "updating a profile and expecting instant offers"
      ]
    };
  }

  if (text.includes("video") || text.includes("youtube") || text.includes("stream")) {
    return {
      oldWay: "opening one video and losing the whole night",
      backgroundQuery: "late night phone scrolling vertical video",
      gifQuery: "pedro pascal laughing",
      jokeAngles: [
        "one quick video becoming a full documentary arc",
        "the algorithm knowing too much",
        "free entertainment feeling suspiciously powerful"
      ]
    };
  }

  if (text.includes("finance") || text.includes("money") || text.includes("budget")) {
    return {
      oldWay: "checking the bank app with one eye open",
      backgroundQuery: "person checking phone budget vertical video",
      gifQuery: "nick young confused",
      jokeAngles: [
        "budget reality check",
        "subscription shame",
        "the bank app becoming a horror movie"
      ]
    };
  }

  return {
    oldWay: "doing it manually for no reason",
    backgroundQuery: `${productBrief.category} phone lifestyle vertical video`,
    gifQuery: "the rock eyebrow",
    jokeAngles: [
      "the old way being embarrassingly extra",
      "finding the shortcut too late",
      "pretending the easy way was the plan all along"
    ]
  };
}
