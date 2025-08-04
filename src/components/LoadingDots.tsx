import "../styles/loading-dots.css";

export function LoadingDots() {
  return (
    <div
      className="flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="El asistente está escribiendo"
    >
      <span className="loader-dot" />
      <span className="loader-dot" />
      <span className="loader-dot" />
    </div>
  );
}
