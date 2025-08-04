import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";

import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

import { ChatBubble } from "../components/ChatBubble";
import { LoadingDots } from "../components/LoadingDots";
import { useChat } from "../hooks/useChat";
import DefaultLayout from "../layout/DefaultLayout";

export default function ChatPage() {
  const { messages, sendQuestion, uploadFile, status, thinking } = useChat();

  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  /* autoscroll al llegar nuevos mensajes */
  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  /* envía mensaje */
  const handleSend = () => {
    if (!input.trim()) return;
    sendQuestion(input.trim());
    setInput("");
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
        <div
          ref={logRef}
          className="flex flex-col flex-1 space-y-3 overflow-y-auto mb-3
                     scrollbar-thin scrollbar-thumb-muted"
        >
          {messages.map((m, i) => (
            <ChatBubble key={i} role={m.role}>
              {m.content}
            </ChatBubble>
          ))}

          {thinking && (
            <div className="self-start max-w-xs rounded-xl bg-muted p-3">
              <LoadingDots />
            </div>
          )}

          {status === "connecting" && (
            <p className="text-sm text-muted-foreground">Conectando…</p>
          )}
        </div>

        <div className="flex gap-2">
          <label
            className="cursor-pointer flex items-center justify-center
                             w-10 h-10 bg-muted rounded-lg hover:bg-muted/80"
          >
            <Upload className="w-5 h-5 text-foreground" />
            <input
              type="file"
              accept=".pdf,.txt"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && uploadFile(e.target.files[0])
              }
            />
          </label>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleSend())
            }
            placeholder="Escribe tu pregunta…"
            className="flex-1 resize-none h-12 bg-muted text-foreground"
          />

          <Button onClick={handleSend} className="shrink-0">
            Enviar
          </Button>
        </div>
      </div>
    </DefaultLayout>
  );
}
