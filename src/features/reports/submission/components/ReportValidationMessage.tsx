interface ReportValidationMessageProps {
  message?: string;
}

export default function ReportValidationMessage({ message }: ReportValidationMessageProps) {
  if (!message) {
    return null;
  }

  return <p className="validation-message">{message}</p>;
}
