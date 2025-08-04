import { useState, useRef, useEffect } from "react";
import { api } from "../api/chat";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface UploadStatus {
  name: string;
  uploading: boolean;
  done: boolean;
}

export function useChat(initialId?: number) {
  const [conversationId, setConversationId] = useState<number | undefined>(
    initialId
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "ready">("idle");
  const [thinking, setThinking] = useState(false);
  const [uploads, setUploads] = useState<UploadStatus[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const queue = useRef<string[]>([]);
  const initOk = useRef(false);

  useEffect(() => {
    if (initOk.current) return;
    initOk.current = true;

    if (conversationId == null) {
      api.newConversation().then(setConversationId);
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
        case "chunk": {
          setMessages((m) => {
            const last = m.at(-1);
            if (last && last.role === "assistant") {
              last.content += content;
              return [...m];
            }
            return [...m, { role: "assistant", content }];
          });
          break;
        }
        case "answer": {
          setMessages((m) => [...m, { role: "assistant", content }]);
          setThinking(false);
          break;
        }
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
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      queue.current.push(q);
      return;
    }
    ws.send(JSON.stringify({ question: q }));
    setMessages((m) => [...m, { role: "user", content: q }]);
    setThinking(true);
  };

  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;

    setUploads((u) => {
      const names = new Set(u.map((x) => x.name));
      const add: UploadStatus[] = files
        .filter((f) => !names.has(f.name))
        .map((f) => ({ name: f.name, uploading: true, done: false }));
      return [...u, ...add];
    });

    let cid = conversationId;
    if (cid == null) {
      cid = await api.newConversation();
      setConversationId(cid);
    }

    for (const file of files) {
      const { conversation_id } = await api.upload(file, cid);
      cid = conversation_id;

      setUploads((u) =>
        u.map((x) =>
          x.name === file.name && x.uploading
            ? { ...x, uploading: false, done: true }
            : x
        )
      );
    }

    if (cid !== conversationId) {
      setConversationId(cid);
      wsRef.current?.close();
      openWs(cid);
    }
  };

  const uploadFile = (f: File) => uploadFiles([f]);

  return {
    messages,
    status,
    thinking,
    uploads,
    sendQuestion,
    uploadFile,
    uploadFiles,
    conversationId,
  };
}
