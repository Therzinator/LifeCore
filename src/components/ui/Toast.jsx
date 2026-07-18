import './Toast.css';

export default function Toast({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-c" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.tekst}
        </div>
      ))}
    </div>
  );
}
