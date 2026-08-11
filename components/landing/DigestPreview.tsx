import React from "react";
import { ArrowUpRight } from "lucide-react";

export const DigestPreview: React.FC = () => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden text-slate-900 transition-all duration-300 hover:border-slate-300">
      {/* Header briefing toolbar */}
      <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Research Briefing · Digest #142
          </span>
        </div>
        <span className="text-xs text-slate-400 font-mono">August 12, 2026</span>
      </div>

      <div className="p-8 md:p-10 space-y-10">
        {/* Briefing summary intro */}
        <div className="space-y-3 pb-6 border-b border-slate-100">
          <div className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            BASED ON YOUR INTERESTS
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700">
            <span className="px-2.5 py-1 bg-slate-100 rounded-md">Power Systems</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md">Renewable Energy</span>
            <span className="px-2.5 py-1 bg-slate-100 rounded-md">Power Electronics</span>
          </div>
        </div>

        {/* Paper 01 */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-slate-400 font-bold">01</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                94% relevant
              </span>
            </div>
            <span className="text-xs text-slate-400">August 8, 2026</span>
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug">
              Physics-Informed Neural Networks for Power System State Estimation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              IEEE Transactions on Power Systems · A. Rahman, J. Chen, M. Patel
            </p>
          </div>

          <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 space-y-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Why this matters
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                This work connects directly to your interest in intelligent power systems and explores a promising approach to state estimation under increasingly complex grid conditions.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Research opportunity
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Most validation remains simulation-based, leaving room for evaluation with real-world grid data.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 font-mono">ID: IEEE-2026-8812</span>
            <a href="#" className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-blue-700 transition-colors">
              Read analysis <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100" />

        {/* Paper 02 */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-slate-400 font-bold">02</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                91% relevant
              </span>
            </div>
            <span className="text-xs text-slate-400">August 6, 2026</span>
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900 leading-snug">
              Grid-Forming Inverters Under High Renewable Penetration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              IEEE Transactions on Energy Conversion · S. Kim, R. Williams, T. Nakamura
            </p>
          </div>

          <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 space-y-3">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Why this matters
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                The paper addresses stability challenges that become increasingly important as conventional synchronous generation is replaced by inverter-based resources.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Research opportunity
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Testing under mixed renewable and storage scenarios remains relatively limited.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400 font-mono">ID: IEEE-2026-7741</span>
            <a href="#" className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-blue-700 transition-colors">
              Read analysis <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
