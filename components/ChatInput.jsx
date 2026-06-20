"use client";

import { useState } from "react";
import { SendHorizontal } from "lucide-react";

export function ChatInput({ disabled, onSend }) {
  const [value, setValue] = useState("");

  function submitMessage(event) {
    event.preventDefault();
    const message = value.trim();

    if (!message || disabled) {
      return;
    }

    setValue("");
    onSend(message);
  }

  return (
    <form className="composer" onSubmit={submitMessage}>
      <textarea
        aria-label="Message"
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            submitMessage(event);
          }
        }}
        placeholder="Paste a product URL or ask what I can do..."
        rows={1}
        value={value}
      />
      <button
        aria-label="Send message"
        className="send-button"
        disabled={disabled || !value.trim()}
        type="submit"
      >
        <SendHorizontal size={20} strokeWidth={2.4} />
      </button>
    </form>
  );
}
