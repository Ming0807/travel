"use client";

import { Component, type ReactNode } from "react";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
  fallbackTitle?: string;
  fallbackDescription?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Reusable ErrorBoundary that catches render errors in its children subtree
 * and displays a graceful fallback UI instead of crashing the whole page.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary fallbackTitle="Section unavailable" fallbackDescription="This section encountered an error.">
 *   <MediaLibrary />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to the parent's onError handler if provided
    this.props.onError?.(error, errorInfo);
    // Also log to console for dev visibility
    console.error("[ErrorBoundary] Caught render error:", error, errorInfo.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-6 py-12 text-center"
          role="alert"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
            <WarningCircle className="text-rose-500" size={22} weight="fill" />
          </div>
          <p className="mt-4 text-sm font-black text-rose-800">
            {this.props.fallbackTitle ?? "This section encountered an error"}
          </p>
          <p className="mt-1 max-w-sm text-xs leading-5 text-rose-600">
            {this.props.fallbackDescription ??
              "Something went wrong while rendering this section. Try refreshing the page."}
          </p>
          {process.env.NODE_ENV === "development" && this.state.error ? (
            <details className="mt-3 max-w-md text-left">
              <summary className="cursor-pointer text-xs font-bold text-rose-400 hover:text-rose-600">
                Technical details
              </summary>
              <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg border border-rose-200 bg-white p-3 text-xs text-rose-700">
                {this.state.error.message}
              </pre>
            </details>
          ) : null}
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-5 py-2.5 text-sm font-bold text-rose-700 shadow-sm transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
          >
            <ArrowClockwise size={16} weight="bold" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
