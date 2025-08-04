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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "ready">("idle");
  const [thinking, setThinking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const queue = useRef<string[]>([]);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (conversationId === undefined) {
      api.newConversation().then((id) => setConversationId(id));
    }
  }, [conversationId]);

  useEffect(() => {
    if (conversationId) openWs(conversationId);
  }, [conversationId]);

  useEffect(() => {
    const close = () => wsRef.current?.close(1000, "tab closed");
    window.addEventListener("beforeunload", close);
    return () => window.removeEventListener("beforeunload", close);
  }, []);

  const openWs = (id: number) => {
    setStatus("connecting");

    const ws = api.openWs(id);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("ready");
      queue.current.forEach((q) => ws.send(JSON.stringify({ question: q })));
      queue.current = [];
    };

    ws.onmessage = (e) => {
      const { type, content } = JSON.parse(e.data);

      switch (type) {
        case "chunk":
          setMessages((m) => {
            const last = m[m.length - 1];
            if (last && last.role === "assistant") {
              last.content += content;
              return [...m];
            }
            return [...m, { role: "assistant", content }];
          });
          break;

        case "answer":
          setMessages((m) => [...m, { role: "assistant", content }]);
          setThinking(false);
          break;

        case "end":
          setThinking(false);
          break;

        default:
          console.warn("WS tipo desconocido:", type);
      }
    };

    ws.onclose = () => {
      setStatus("idle");
      setThinking(false);
    };
  };

  const sendQuestion = (q: string) => {
    const ws = wsRef.current;
    console.log("sendQuestion", q, "ws state", ws?.readyState); // 👀

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      queue.current.push(q);
      return;
    }
    console.log("→ sending", q);
    ws.send(JSON.stringify({ question: q }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setThinking(true);
  };

  const uploadFile = async (file: File) => {
    if (!conversationId) {
      const id = await api.newConversation();
      setConversationId(id);
    }

    const res = await api.upload(file, conversationId);

    if (conversationId !== res.conversation_id) {
      setConversationId(res.conversation_id);
      wsRef.current?.close();
      openWs(res.conversation_id);
    }
  };

  return {
    messages,
    status,
    thinking,
    sendQuestion,
    uploadFile,
    conversationId,
  };
}
