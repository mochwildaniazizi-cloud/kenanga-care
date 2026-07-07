"use client";

import React from "react";
import { MdOutlineError } from "react-icons/md";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 min-h-[400px] text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 bg-status-red-light text-status-red-solid rounded-full flex items-center justify-center shadow-sm">
            <MdOutlineError className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-base-text-primary">Terjadi Kesalahan Halaman</h3>
          <p className="text-xs text-base-text-secondary leading-relaxed">
            Halaman ini gagal dimuat karena kendala teknis. Detail kesalahan:
          </p>
          <div className="bg-base-bg/50 border border-base-border/30 rounded-xl p-3 text-left font-mono text-[10px] text-status-red-solid overflow-x-auto w-full max-h-40">
            {this.state.error?.message || String(this.state.error)}
          </div>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
            className="px-4 py-2 bg-brand-primary text-base-white rounded-xl text-xs font-bold hover:bg-brand-primary/95 transition shadow-md shadow-brand-primary/10 cursor-pointer"
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
