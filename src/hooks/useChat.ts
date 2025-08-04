import { useState, useRef, useEffect } from "react";
import { api } from "../api/chat";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export function useChat(initialId?: number) {
  const [conversationId, setConversationId] = useState<number | undefined>(
    initialId
  );

  const wsRef = useRef<WebSocket | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "ready">("idle");
  const [thinking, setThinking] = useState(false);

  const uploadFile = async (file: File) => {
    console.log("uploadFile called:", file);

    const res = await api.upload(file, conversationId);

    if (conversationId !== res.conversation_id) {
      setConversationId(res.conversation_id);
      wsRef.current?.close();
      openWs(res.conversation_id);
    }
  };

  const sendQuestion = (q: string) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({ question: q }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setThinking(true);
  };

  const openWs = (id: number) => {
    setStatus("connecting");

    const ws = api.openWs(id);
    wsRef.current = ws;

    ws.onopen = () => setStatus("ready");

    ws.onmessage = (e) => {
      const { type, content } = JSON.parse(e.data);

      if (type === "chunk") {
        setMessages((m) => {
          const last = m[m.length - 1];
          if (last && last.role === "assistant") {
            last.content += content;
            return [...m];
          }
          return [...m, { role: "assistant", content }];
        });
      } else if (type === "end") {
        setThinking(false);
      }
    };

    ws.onclose = () => {
      setStatus("idle");
      setThinking(false);
    };
  };

  useEffect(() => {
    if (conversationId) openWs(conversationId);
  }, [conversationId]);

  return {
    messages,
    status,
    thinking,
    sendQuestion,
    uploadFile,
  };
}
