interface ValidationMessageProps {
  message?: string;
}

export default function ValidationMessage({ message }: ValidationMessageProps) {
  if (!message) {
    return null;
  }

  return <p className="validation-message">{message}</p>;
}
