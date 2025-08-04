import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";

import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { ChatBubble } from "../components/ChatBubble";
import { LoadingDots } from "../components/LoadingDots";
import { useChat } from "../hooks/useChat";
import DefaultLayout from "../layout/DefaultLayout";

const FileChip = ({ name, done }: { name: string; done: boolean }) => (
  <div
    className="flex items-center gap-1 text-sm bg-muted/80 rounded px-2 py-1
               whitespace-nowrap max-w-full overflow-hidden text-ellipsis"
  >
    <Upload className="w-4 h-4 shrink-0 opacity-70" />
    <span className="grow overflow-hidden text-ellipsis">{name}</span>
    {done ? (
      <span className="text-green-500">✓</span>
    ) : (
      <span className="animate-pulse">…</span>
    )}
  </div>
);

export default function ChatPage() {
  const { messages, sendQuestion, uploadFiles, status, thinking, uploads } =
    useChat();

  const [input, setInput] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const dropActiveRef = useRef(false);

  /* autoscroll */
  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, thinking]);

  /* -------- envío de texto -------- */
  const handleSend = () => {
    if (!input.trim()) return;
    sendQuestion(input.trim());
    setInput("");
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dropActiveRef.current) {
      dropActiveRef.current = true;
      logRef.current?.classList.add("ring-2", "ring-primary");
    }
  };

  const onDragLeave = () => {
    dropActiveRef.current = false;
    logRef.current?.classList.remove("ring-2", "ring-primary");
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragLeave();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      /\.(pdf|txt)$/i.test(f.name)
    );
    if (files.length) uploadFiles(files);
  };

  return (
    <DefaultLayout>
      <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
        <div
          ref={logRef}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className="flex flex-col flex-1 space-y-3 overflow-y-auto mb-3
                     scrollbar-thin scrollbar-thumb-muted transition-all"
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

          {uploads.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {uploads.map((u) => (
                <FileChip key={u.name} name={u.name} done={u.done} />
              ))}
            </div>
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
              multiple
              onChange={(e) =>
                e.target.files && uploadFiles(Array.from(e.target.files))
              }
            />
          </label>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) =>
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
