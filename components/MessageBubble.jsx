import { PreferencePicker } from "@/components/PreferencePicker";

export function MessageBubble({
  disabled,
  message,
  onPreferenceSubmit,
  showPreferencePicker
}) {
  return (
    <article className={`message ${message.role}`}>
      <div className="message-label">
        {message.role === "user" ? "You" : "UGC Studio"}
      </div>
      <p>{message.content}</p>
      {showPreferencePicker ? (
        <PreferencePicker
          disabled={disabled}
          groups={message.preferenceOptions}
          onSubmit={onPreferenceSubmit}
        />
      ) : null}
      {message.videoUrl ? (
        <video className="video-preview" controls playsInline src={message.videoUrl} />
      ) : null}
    </article>
  );
}
