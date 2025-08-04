import { cn } from "../lib/utils";

export function ChatBubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-md rounded-xl p-3 whitespace-pre-wrap",
        role === "user"
          ? "bg-accent text-white self-end"
          : "bg-muted text-foreground self-start"
      )}
    >
      {children}
    </div>
  );
}
