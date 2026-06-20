"use client";

import { useMemo, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { ChatInput } from "@/components/ChatInput";
import { MessageBubble } from "@/components/MessageBubble";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Hey, I’m UGC Studio. Send me a product URL and I’ll help turn it into a short-form UGC video."
  }
];

function createMessage(role, content, extra = {}) {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    ...extra
  };
}

export function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef(null);

  const canSend = useMemo(() => !isSending, [isSending]);

  async function handleSend(content) {
    const trimmed = content.trim();

    if (!trimmed || isSending) {
      return;
    }

    const userMessage = createMessage("user", trimmed);
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setIsSending(true);

    requestAnimationFrame(() => {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth"
      });
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content }))
        })
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = await response.json();
      setMessages((current) => [
        ...current,
        createMessage("assistant", data.message.content, {
          status: data.message.status
        })
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        createMessage(
          "assistant",
          "I hit a snag replying to that. Try again in a second."
        )
      ]);
    } finally {
      setIsSending(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: "smooth"
        });
      });
    }
  }

  return (
    <section className="chat-panel" aria-label="UGC Studio chat">
      <header className="chat-header">
        <div className="brand-mark" aria-hidden="true">
          <Sparkles size={20} strokeWidth={2.4} />
        </div>
        <div>
          <p className="eyebrow">UGC Studio</p>
          <h1>Product URL to UGC video</h1>
        </div>
      </header>

      <div className="message-list" ref={listRef}>
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isSending ? (
          <div className="typing-row" aria-live="polite">
            <Loader2 size={18} className="spin" />
            Thinking through the angle...
          </div>
        ) : null}
      </div>

      <ChatInput disabled={!canSend} onSend={handleSend} />
    </section>
  );
}
