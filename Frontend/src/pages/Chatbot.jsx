import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Send, Info } from 'lucide-react';
import { chatApi } from '@/api/chat';
import { apiErrorMessage } from '@/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SuggestedQuestions } from '@/components/chat/SuggestedQuestions';
import { ChatThread } from '@/components/chat/ChatThread';

let seq = 0;
const nextId = () => `m${++seq}`;

/**
 * RAG chatbot (§8.8). The thread lives in client-side session state (no history
 * GET endpoint yet — TRD gap); each send persists server-side via /api/chat/ask.
 */
export default function Chatbot() {
  const { state } = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);

  // `pending` is React state, so it is still false for every click in a rapid
  // burst - a synchronous ref is what actually blocks a double submission.
  const sending = useRef(false);

  const send = async (questionText) => {
    const question = (questionText ?? input).trim();
    if (!question || sending.current) return;
    sending.current = true;
    setInput('');

    const userMsg = { id: nextId(), role: 'user', text: question };
    const aiPlaceholder = { id: nextId(), role: 'ai', pending: true };
    setMessages((m) => [...m, userMsg, aiPlaceholder]);
    setPending(true);

    try {
      const res = await chatApi.ask(question);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === aiPlaceholder.id
            ? { ...msg, pending: false, text: res.answer, sources: res.sources || [] }
            : msg,
        ),
      );
    } catch (e) {
      setMessages((m) =>
        m.map((msg) =>
          msg.id === aiPlaceholder.id
            ? { ...msg, pending: false, error: true, text: apiErrorMessage(e, "Couldn't get an answer — try again."), question }
            : msg,
        ),
      );
    } finally {
      sending.current = false;
      setPending(false);
    }
  };

  // A rule citation elsewhere in the app can deep-link here with a question.
  // The ref makes sure it is asked once, not again on every re-render.
  const askedFromRoute = useRef(false);
  useEffect(() => {
    if (state?.question && !askedFromRoute.current) {
      askedFromRoute.current = true;
      send(state.question);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const retry = (msg) => {
    setMessages((m) => m.filter((x) => x.id !== msg.id));
    send(msg.question);
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col">
      <div className="mb-2 flex items-center gap-2 rounded-md bg-surface px-3 py-2 text-caption text-text-muted">
        <Info className="h-4 w-4" /> Informational only — not tax advice.
      </div>

      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto">
          <SuggestedQuestions onPick={send} />
        </div>
      ) : (
        <ChatThread messages={messages} onRetry={retry} onSuggestionClick={send} disabled={pending} />
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-2 flex items-center gap-2 border-t border-border pt-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a tax question…"
          aria-label="Your question"
          disabled={pending}
        />
        <Button type="submit" size="icon" disabled={pending || !input.trim()} aria-label="Send">
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
