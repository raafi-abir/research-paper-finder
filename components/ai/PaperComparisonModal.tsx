"use client";

import React, { useState, useEffect } from "react";
import { X, RefreshCw, AlertCircle, ArrowUpRight, Scale, CheckCircle2, Split } from "lucide-react";
import { PaperComparisonResult } from "@/lib/ai/types";

interface PaperComparisonModalProps {
  paperIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function PaperComparisonModal({
  paperIds,
  isOpen,
  onClose,
}: PaperComparisonModalProps) {
  const [comparison, setComparison] = useState<PaperComparisonResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComparison = async () => {
    if (paperIds.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperIds }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setComparison(data.comparison);
      } else {
        setError(data.error || "Unable to compare the selected papers.");
      }
    } catch {
      setError("Failed to connect to the comparison service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && paperIds.length > 0) {
      setComparison(null);
      fetchComparison();
    }
  }, [isOpen, paperIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-slate-900" />
              <span>CROSS-PAPER RESEARCH SYNTHESIS · {paperIds.length} PAPERS</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug">
              Comparative Analysis & Synthesis
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8 text-slate-700">
          {isLoading ? (
            /* CLEAN LOADING SKELETON */
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Synthesizing papers…</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Comparing methodologies, identifying areas of consensus, and highlighting collective research gaps.
              </p>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Comparison unavailable</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">{error}</p>
              <button
                onClick={fetchComparison}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : comparison ? (
            <div className="space-y-8">
              {/* 1. SYNTHESIS OVERVIEW */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                  Collective Synthesis Overview
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {comparison.overview}
                </p>
              </div>

              {/* 2. COMMON THEMES */}
              <div className="space-y-2">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                  Shared Research Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {comparison.commonThemes.map((theme, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-white border border-slate-200/90 rounded-lg text-xs text-slate-800 shadow-2xs"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. COMPARISON TABLE */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                  Methodological Comparison Table
                </h3>
                <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse divide-y divide-slate-200">
                    <thead className="bg-slate-50 font-mono text-slate-600">
                      <tr>
                        <th className="p-3 font-semibold">Paper</th>
                        <th className="p-3 font-semibold">Approach</th>
                        <th className="p-3 font-semibold">Methodology</th>
                        <th className="p-3 font-semibold">Main Finding</th>
                        <th className="p-3 font-semibold">Key Limitation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {comparison.comparison.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 font-medium text-slate-900 max-w-xs">{item.title}</td>
                          <td className="p-3 text-slate-700 whitespace-nowrap">{item.approach}</td>
                          <td className="p-3 text-slate-600 max-w-xs">{item.methodology}</td>
                          <td className="p-3 text-slate-700 max-w-xs">{item.mainFinding}</td>
                          <td className="p-3 text-slate-500 max-w-xs">{item.limitations[0] || "Simulated scope"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. METHODOLOGICAL DIFFERENCES & CONSENSUS */}
              <div className="grid md:grid-cols-2 gap-6 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-slate-500" />
                    <span>Methodological Trade-offs</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {comparison.methodologicalDifferences.map((diff, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-slate-400 font-bold">·</span>
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Points of Consensus</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {comparison.findingsAgreement.map((agr, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{agr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 5. COLLECTIVE RESEARCH GAPS & FUTURE DIRECTIONS */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                    Unresolved Research Gaps Across Studies
                  </h3>
                  <div className="space-y-2 text-xs text-slate-700">
                    {comparison.researchGaps.map((gap, i) => (
                      <div key={i} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-amber-950">
                        {gap}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                    Promising Future Directions
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {comparison.promisingDirections.map((dir, i) => (
                      <li key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-semibold text-slate-900">Direction {i + 1}: </span>
                        <span>{dir}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
          <span>Comparing {paperIds.length} papers · AI Research Intelligence</span>
          <button
            onClick={fetchComparison}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-synthesize</span>
          </button>
        </div>
      </div>
    </div>
  );
}
