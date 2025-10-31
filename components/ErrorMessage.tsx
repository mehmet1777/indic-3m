import { Button } from './Button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export const ErrorMessage = ({ message, onRetry, onBack }: ErrorMessageProps) => {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="mb-4">
        <svg
          className="w-16 h-16 mx-auto text-error"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-text-primary mb-2">Error</h2>
      <p className="text-text-secondary mb-6">{message}</p>
      <div className="flex gap-3 justify-center">
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            Retry
          </Button>
        )}
        {onBack && (
          <Button onClick={onBack} variant="secondary">
            Back to Search
          </Button>
        )}
      </div>
    </div>
  );
};
