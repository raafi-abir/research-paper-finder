import Link from "next/link";
import React from "react";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-200/60 bg-[#FAFAFA] py-16 text-slate-600">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
        <div className="max-w-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-semibold tracking-tight text-base">
            <span className="w-2 h-2 rounded-full bg-slate-900" />
            <span>PaperScout</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Personal research intelligence for curious people. We quietly monitor the literature so you stay ahead.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-xs">
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#how-it-works" className="hover:text-slate-900 transition-colors">
                  How it works
                </a>
              </li>
              <li>
                <a href="#research-example" className="hover:text-slate-900 transition-colors">
                  Research
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="hover:text-slate-900 transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-slate-900 transition-colors">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-slate-900 transition-colors">
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 pt-6 border-t border-slate-200/40 flex items-center justify-between text-xs text-slate-400">
        <p>© {new Date().getFullYear()} PaperScout. All rights reserved.</p>
        <p className="font-mono">v1.0.0 · Editorial Digest Edition</p>
      </div>
    </footer>
  );
};
