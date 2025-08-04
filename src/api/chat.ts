type JsonBody = object;
type BodyInit = JsonBody | FormData | undefined;
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface Options {
  body?: BodyInit;
  method?: HttpMethod;
  isFormData?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const getToken = () => localStorage.getItem("token") ?? "";

async function request<T>(url: string, opts: Options = {}): Promise<T> {
  const { body, method = "GET", isFormData } = opts;

  const headers: HeadersInit = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/${url}`, {
    method,
    headers,
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message ?? "Request error") as Error & {
      code?: string;
    };
    err.code = data.code;
    throw err;
  }
  return data as T;
}

export interface UploadRes {
  conversation_id: number;
  document_id: number;
  chunks: number;
}

export const api = {
  get: <T>(u: string) => request<T>(u),

  post: <T, B extends JsonBody | FormData = JsonBody>(
    u: string,
    b: B,
    isFD = b instanceof FormData
  ) => request<T>(u, { method: "POST", body: b, isFormData: isFD }),

  upload(file: File, conversationId?: number) {
    const fd = new FormData();
    fd.append("file", file);
    if (conversationId !== undefined) {
      fd.append("conversation_id", conversationId.toString());
    }
    return api.post<UploadRes>("upload", fd, true);
  },

  openWs(conversationId: number) {
    const wsURL = API_BASE_URL.replace(/^http/, "ws");
    return new WebSocket(`${wsURL}/ws/conversation/${conversationId}`);
  },

  async newConversation(): Promise<number> {
    const res = await request<{ conversation_id: number }>("ws/conversation", {
      method: "POST",
    });
    return res.conversation_id;
  },
};
