"use client";

import React, { useState, useCallback } from "react";

interface ErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

function ErrorFallback({ error, reset }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="text-white/50 text-sm leading-relaxed">
          An error occurred. Please try refreshing the page.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="text-left text-xs text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl p-4 overflow-auto max-h-40">
            {error?.message}
          </pre>
        )}
        <button
          onClick={reset}
          className="px-6 py-3 rounded-2xl bg-white/10 border border-white/10 text-white font-bold text-sm hover:bg-white/20 transition-all"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
    window.location.reload();
  }, []);

  if (error) {
    return <ErrorFallback error={error} reset={reset} />;
  }

  return (
    <React.Fragment>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            onError: (err: Error) => setError(err),
          });
        }
        return child;
      })}
    </React.Fragment>
  );
}
