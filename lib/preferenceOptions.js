const defaultOptions = {
  tone: [
    "Roast the old way",
    "POV: shortcut found me",
    "Be so real about it",
    "Delulu but efficient",
    "Quietly judging my choices",
    "Group chat intervention"
  ],
  audience: [
    "people doing it manually",
    "busy people pretending it is fine",
    "shortcut skeptics",
    "the group chat problem-solvers",
    "late adopters with excuses",
    "anyone allergic to extra steps"
  ],
  goal: [
    "Expose the old way",
    "Make the shortcut obvious",
    "Earn the rage-click",
    "Get the group chat share",
    "Turn pain into signups",
    "Make trying it feel overdue"
  ]
};

const categoryPresets = [
  {
    match: /calorie|macro|fitness|workout|nutrition|meal|diet|food/i,
    tone: [
      "Roast my macro math",
      "POV: calories got exposed",
      "Delulu meal logger",
      "Gym bro side-eye",
      "Be so real about tracking",
      "Unhinged nutrition receipt"
    ],
    audience: [
      "macro guessers in denial",
      "gym people logging vibes",
      "meal-prep optimists",
      "calorie trackers with trust issues",
      "cutting-season survivors",
      "snack accountants"
    ],
    goal: [
      "Expose manual logging",
      "Make them download before dinner",
      "Turn macro panic into clicks",
      "Make tracking look effortless",
      "Get the gym chat laughing",
      "Sell the shortcut"
    ]
  },
  {
    match: /skin|beauty|serum|makeup|hair|glow|cosmetic/i,
    tone: [
      "Mirror said be serious",
      "Glow-up with side-eye",
      "Routine roast",
      "POV: skin stopped playing",
      "Delulu bathroom counter",
      "Beauty aisle confession"
    ],
    audience: [
      "mirror detectives",
      "routine overthinkers",
      "glow-up optimists",
      "skin-care TikTok victims",
      "bathroom shelf maximalists",
      "people buying one more serum"
    ],
    goal: [
      "Make the routine feel obvious",
      "Get the mirror-check click",
      "Turn skincare chaos into trust",
      "Make them shop the fix",
      "Earn the bestie share",
      "Sell the glow-up"
    ]
  },
  {
    match: /saas|crm|workflow|invoice|productivity|automation|team|founder|b2b|dashboard/i,
    tone: [
      "Roast spreadsheet cosplay",
      "Founder panic, but funny",
      "POV: ops stopped suffering",
      "Slack-thread sarcasm",
      "Be so real about manual work",
      "Meeting-that-could-be-a-tool"
    ],
    audience: [
      "spreadsheet cosplay victims",
      "founders doing 14 tabs",
      "ops people one Slack away",
      "teams allergic to manual work",
      "busy pros pretending it scales",
      "people with dashboard trust issues"
    ],
    goal: [
      "Turn pain into demos",
      "Make manual work look embarrassing",
      "Get the founder click",
      "Sell the workflow upgrade",
      "Make signups feel urgent",
      "Win the team chat"
    ]
  },
  {
    match: /finance|money|budget|bank|invest|expense|subscription|tax|wallet/i,
    tone: [
      "Bank app jump scare",
      "Budget roast",
      "Subscription shame spiral",
      "POV: money got receipts",
      "Delulu spending confession",
      "Adulting with side-eye"
    ],
    audience: [
      "subscription detectives with trauma",
      "budget avoiders",
      "people checking balance sideways",
      "payday optimists",
      "expense trackers in denial",
      "money people with trust issues"
    ],
    goal: [
      "Turn panic into signups",
      "Make control feel funny",
      "Expose the money leak",
      "Get the budget click",
      "Make adulting look easier",
      "Earn the payday share"
    ]
  },
  {
    match: /course|learn|lesson|student|education|school|study|tutor|exam/i,
    tone: [
      "Study panic, but useful",
      "POV: cramming got humbled",
      "Academic weapon sarcasm",
      "Be so real about procrastinating",
      "Exam-week side-eye",
      "Delulu productivity arc"
    ],
    audience: [
      "deadline sprinters",
      "students pretending they studied",
      "course collectors",
      "exam-week survivors",
      "notes-app scholars",
      "people learning at 1 AM"
    ],
    goal: [
      "Make them start learning",
      "Turn panic into clicks",
      "Sell the study shortcut",
      "Get the class group share",
      "Make progress feel overdue",
      "Convert procrastination"
    ]
  },
  {
    match: /travel|hotel|flight|trip|vacation|booking|itinerary/i,
    tone: [
      "Trip-planning chaos",
      "POV: itinerary stopped fighting",
      "Airport panic with jokes",
      "Vacation delulu",
      "Group-trip side-eye",
      "Roast the planning spreadsheet"
    ],
    audience: [
      "group-trip diplomats",
      "overpackers with tabs open",
      "people planning from 17 tabs",
      "airport anxiety professionals",
      "vacation optimists",
      "itinerary control freaks"
    ],
    goal: [
      "Make booking feel easy",
      "Get the trip-planning click",
      "Sell the calm version",
      "Earn the group chat share",
      "Expose itinerary chaos",
      "Make them book faster"
    ]
  }
];

export function createPreferenceOptions(productBrief = {}) {
  const preset = findPreset(productBrief);
  const productName = cleanLabel(productBrief.productName, "this product");
  const painPoint = cleanLabel(productBrief.painPoint, "the annoying part");
  const audience = cleanLabel(productBrief.targetAudience, "the people who need it");
  const cta = cleanLabel(productBrief.cta, "Try it");

  return [
    {
      id: "tone",
      label: "Tone",
      options: pickSix([
        ...(preset?.tone || []),
        `${productName} judging the old way`,
        `Roast ${shorten(painPoint, 26)}`,
        ...defaultOptions.tone
      ])
    },
    {
      id: "audience",
      label: "Audience",
      options: pickSix([
        ...(preset?.audience || []),
        `${shorten(audience, 28)} with receipts`,
        `${shorten(audience, 28)} in denial`,
        ...defaultOptions.audience
      ])
    },
    {
      id: "goal",
      label: "Goal",
      options: pickSix([
        ...(preset?.goal || []),
        `Make "${shorten(cta, 18)}" feel obvious`,
        `Turn ${shorten(painPoint, 24)} into clicks`,
        ...defaultOptions.goal
      ])
    }
  ];
}

function findPreset(productBrief) {
  const text = [
    productBrief.productName,
    productBrief.category,
    productBrief.targetAudience,
    productBrief.painPoint,
    productBrief.mainBenefit
  ]
    .filter(Boolean)
    .join(" ");

  return categoryPresets.find((preset) => preset.match.test(text));
}

function cleanLabel(value, fallback) {
  return String(value || fallback)
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[.?!]+$/g, "");
}

function shorten(value, maxLength) {
  const clean = cleanLabel(value, "");

  if (clean.length <= maxLength) {
    return clean;
  }

  return clean.slice(0, maxLength - 1).trim();
}

function pickSix(options) {
  return [...new Set(options.filter(Boolean))].slice(0, 6);
}
