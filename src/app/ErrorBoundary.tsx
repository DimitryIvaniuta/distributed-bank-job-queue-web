import { Component, type ErrorInfo, type ReactNode } from 'react';

import { runtimeConfig } from '../config/runtimeConfig';

interface ErrorBoundaryState {
  hasError: boolean;
  incidentId: string | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false, incidentId: null };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true, incidentId: crypto.randomUUID() };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    const incidentId = this.state.incidentId ?? 'unavailable';
    console.error('Unrecoverable UI error', {
      componentStack: info.componentStack,
      errorName: error.name,
      incidentId,
      release: runtimeConfig.release,
    });
    window.dispatchEvent(
      new CustomEvent('bankflow:client-error', {
        detail: { errorName: error.name, incidentId, release: runtimeConfig.release },
      }),
    );
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="fatal-error">
          <div className="card fatal-error__card">
            <span className="eyebrow">Application error</span>
            <h1>The operations console could not continue</h1>
            <p>No job submission is retried automatically by this screen.</p>
            {this.state.incidentId ? (
              <code className="fatal-error__reference">
                Support reference: {this.state.incidentId}
              </code>
            ) : null}
            <div className="button-row fatal-error__actions">
              <button
                type="button"
                className="button button--secondary"
                onClick={() => this.setState({ hasError: false, incidentId: null })}
              >
                Try again
              </button>
              <button
                type="button"
                className="button button--primary"
                onClick={() => location.reload()}
              >
                Reload console
              </button>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
