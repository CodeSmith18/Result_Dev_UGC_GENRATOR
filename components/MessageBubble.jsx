export function MessageBubble({ message }) {
  return (
    <article className={`message ${message.role}`}>
      <div className="message-label">
        {message.role === "user" ? "You" : "UGC Studio"}
      </div>
      <p>{message.content}</p>
      {message.videoUrl ? (
        <video className="video-preview" controls playsInline src={message.videoUrl} />
      ) : null}
    </article>
  );
}
