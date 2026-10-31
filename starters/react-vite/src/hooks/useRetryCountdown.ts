import { useState, useEffect, useRef } from "react";

export function useRetryCountdown(
  retryAfterSeconds: number | undefined,
  onRetry: () => void
) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof retryAfterSeconds === "number" && retryAfterSeconds > 0) {
      setCountdown(retryAfterSeconds);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerRef.current!);
            onRetry();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(null);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [retryAfterSeconds, onRetry]);

  return { countdown };
}