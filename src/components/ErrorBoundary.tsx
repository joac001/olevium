'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

const DEFAULT_MESSAGE = 'Tuvimos un problema inesperado. Intentá recargar la página o volvete al inicio.';

export type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export type ErrorBoundaryState = {
  hasError: boolean;
  message?: string;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[olevium] Unhandled error', error, info);
  }

  resetBoundary = () => {
    this.setState({ hasError: false, message: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-950 text-slate-100 px-4 text-center">
          <h1 className="text-2xl font-semibold">Ups! Algo salió mal</h1>
          <p className="text-sm text-slate-400 max-w-md">{this.state.message || DEFAULT_MESSAGE}</p>
          <button
            onClick={this.resetBoundary}
            className="rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-brand-900/40"
          >
            Reintentar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
