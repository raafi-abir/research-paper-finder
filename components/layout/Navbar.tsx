"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isDashboard = pathname === "/dashboard";
  const isProfile = pathname === "/profile";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-[#FAFAFA]/90 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 text-slate-900 font-semibold tracking-tight text-lg"
        >
          <span className="w-2 h-2 rounded-full bg-slate-900 group-hover:scale-125 transition-transform duration-200" />
          <span>PaperScout</span>
        </Link>

        {/* Center Nav for Public Pages */}
        {!isDashboard && !isProfile && !isAuthPage && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600 font-normal">
            <a
              href="#how-it-works"
              className="hover:text-slate-900 transition-colors"
            >
              How it works
            </a>
            <a
              href="#research-example"
              className="hover:text-slate-900 transition-colors"
            >
              Research
            </a>
            <a
              href="#about"
              className="hover:text-slate-900 transition-colors"
            >
              About
            </a>
          </nav>
        )}

        {/* Dashboard Nav Links */}
        {isDashboard && (
          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <Link
              href="/dashboard"
              className="text-slate-900 font-medium border-b border-slate-900 pb-0.5"
            >
              Dashboard
            </Link>
            <Link
              href="/profile"
              className="hover:text-slate-900 transition-colors"
            >
              Research profile
            </Link>
          </nav>
        )}

        {/* Right CTAs */}
        <div className="flex items-center gap-5 text-sm">
          {isDashboard ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                Monitoring Active
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs border border-slate-300">
                EE
              </div>
            </div>
          ) : isAuthPage ? (
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-900 transition-colors"
            >
              Back to home →
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-slate-900 text-white text-xs px-3.5 py-2 rounded-md font-medium hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
