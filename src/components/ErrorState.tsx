import Link from "next/link";

interface ErrorStateProps {
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
}

export default function ErrorState({
  title,
  message,
  actionText = "Return to items",
  actionUrl = "/",
}: ErrorStateProps) {
  return (
    <section className="error-state-card">
      <div className="error-state-content">
        <p className="error-state-eyebrow">Item unavailable</p>
        <h2 className="error-state-title">{title}</h2>
        <p className="error-state-message">{message}</p>
        <Link href={actionUrl} className="secondary-link">
          {actionText}
        </Link>
      </div>
    </section>
  );
}
