"use client";

import { useEffect, useMemo, useState } from "react";

const fallbackPreferenceGroups = [
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

export function PreferencePicker({ disabled, groups, onSubmit }) {
  const preferenceGroups = useMemo(() => normalizeGroups(groups), [groups]);
  const defaults = useMemo(() => getDefaultSelections(preferenceGroups), [
    preferenceGroups
  ]);
  const [selected, setSelected] = useState(defaults);

  const submitText = useMemo(
    () =>
      preferenceGroups
        .map((group) => `${group.label}: ${selected[group.id] || group.options[0]}`)
        .join("\n"),
    [preferenceGroups, selected]
  );

  useEffect(() => {
    setSelected(defaults);
  }, [defaults]);

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

function normalizeGroups(groups) {
  const normalized = Array.isArray(groups)
    ? groups
        .map((group) => ({
          id: String(group?.id || "").trim(),
          label: String(group?.label || "").trim(),
          options: Array.isArray(group?.options)
            ? group.options
                .map((option) => String(option || "").trim())
                .filter(Boolean)
            : []
        }))
        .filter((group) => group.id && group.label && group.options.length)
    : [];

  return normalized.length ? normalized : fallbackPreferenceGroups;
}

function getDefaultSelections(groups) {
  return groups.reduce((next, group) => {
    next[group.id] = group.options[0];
    return next;
  }, {});
}
