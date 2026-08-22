import { useEffect, useRef } from 'react';
import { ChatMessageBubble } from './ChatMessageBubble';

/** Scrollable message list that auto-scrolls to the newest bubble. */
export function ChatThread({ messages, onRetry, onSuggestionClick, disabled }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-4">
      {messages.map((m) => (
        <ChatMessageBubble
            key={m.id}
            message={m}
            onRetry={() => onRetry(m)}
            onSuggestionClick={onSuggestionClick}
            disabled={disabled}
          />
      ))}
      <div ref={endRef} />
    </div>
  );
}
