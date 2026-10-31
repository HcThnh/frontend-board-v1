import { useRetryCountdown } from "../../hooks/useRetryCountdown";

interface Props {
  error: string;
  statusCode?: number;
  retryAfter?: number;
  onRetry: () => void;
}

export function ErrorAlert({ error, statusCode, retryAfter, onRetry }: Props) {
  const { countdown } = useRetryCountdown(retryAfter, onRetry);

  return (
    <div className="error-alert" role="alert" aria-live="assertive">
      <div className="error-alert-content">
        <span className="error-icon" aria-hidden="true">⚠️</span>
        <div>
          <strong className="error-title">
            {statusCode === 429 ? "Rate Limit Exceeded" : "Connection Error"}
          </strong>
          <p className="error-msg">{error}</p>
          {countdown !== null && (
            <p className="countdown-msg">
              Retrying automatically in <strong>{countdown}s</strong>...
            </p>
          )}
        </div>
      </div>
      <button
        className="retry-btn"
        onClick={onRetry}
        disabled={countdown !== null && countdown > 0}
        aria-label="Retry operation now"
      >
        Retry Now
      </button>
    </div>
  );
}