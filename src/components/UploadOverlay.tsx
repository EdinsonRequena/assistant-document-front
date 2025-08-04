import { Upload } from "lucide-react";
import { cn } from "../lib/utils";

interface Props {
  show: boolean;
}

export function UploadOverlay({ show }: Props) {
  if (!show) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="flex flex-col items-center gap-2 p-6 bg-muted rounded-xl border border-border">
        <Upload className="w-10 h-10 text-foreground" />
        <p className="text-lg">Suelta el/los archivo(s)…</p>
      </div>
    </div>
  );
}
