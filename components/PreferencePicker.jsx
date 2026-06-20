"use client";

import { useMemo, useState } from "react";

const preferenceGroups = [
  {
    id: "tone",
    label: "Tone",
    options: [
      "Funny meme",
      "Chaotic",
      "Bold",
      "Premium",
      "Founder-style",
      "Educational"
    ]
  },
  {
    id: "audience",
    label: "Audience",
    options: [
      "Gen Z",
      "College students",
      "Busy professionals",
      "Creators",
      "Founders",
      "Fitness people"
    ]
  },
  {
    id: "goal",
    label: "Goal",
    options: ["Laughs", "Clicks", "App installs", "Purchases", "Signups", "Trust"]
  }
];

const defaults = {
  tone: "Funny meme",
  audience: "Gen Z",
  goal: "Clicks"
};

export function PreferencePicker({ disabled, onSubmit }) {
  const [selected, setSelected] = useState(defaults);

  const submitText = useMemo(
    () => `${selected.tone}, ${selected.audience}, ${selected.goal}`,
    [selected]
  );

  function choose(groupId, value) {
    if (disabled) {
      return;
    }

    setSelected((current) => ({
      ...current,
      [groupId]: value
    }));
  }

  return (
    <div className="preference-picker">
      {preferenceGroups.map((group) => (
        <div className="preference-group" key={group.id}>
          <div className="preference-label">{group.label}</div>
          <div className="preference-options">
            {group.options.map((option) => {
              const isSelected = selected[group.id] === option;

              return (
                <button
                  aria-pressed={isSelected}
                  className={`preference-chip ${isSelected ? "selected" : ""}`}
                  disabled={disabled}
                  key={option}
                  onClick={() => choose(group.id, option)}
                  type="button"
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        className="generate-choice-button"
        disabled={disabled}
        onClick={() => onSubmit(submitText)}
        type="button"
      >
        Generate meme video
      </button>
    </div>
  );
}
