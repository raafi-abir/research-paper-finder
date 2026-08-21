"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, RefreshCw, AlertCircle, ArrowUpRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { PaperAnalysisResult } from "@/lib/ai/types";

interface PaperAnalysisModalProps {
  paperId: string | null;
  paperTitle?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function PaperAnalysisModal({
  paperId,
  paperTitle,
  isOpen,
  onClose,
}: PaperAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<PaperAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "methodology" | "findings" | "limitations">("summary");

  const fetchAnalysis = async (forceRefresh = false) => {
    if (!paperId) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/ai/papers/${paperId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAnalysis(data);
      } else {
        setError(data.error || "Unable to analyze this paper right now.");
      }
    } catch {
      setError("Failed to connect to the analysis service.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && paperId) {
      setAnalysis(null);
      fetchAnalysis(false);
    }
  }, [isOpen, paperId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200/90 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span>RESEARCH INTELLIGENCE ANALYSIS</span>
              {analysis?.analysisSource && (
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                  {analysis.analysisSource === "FULL_TEXT"
                    ? "Full Text Analysis"
                    : "Abstract & Metadata"}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-snug line-clamp-2">
              {paperTitle || "Paper Research Breakdown"}
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

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-100 bg-slate-50/50 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab("summary")}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "summary"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Summary & Highlights
          </button>
          <button
            onClick={() => setActiveTab("methodology")}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "methodology"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Methodology & Setup
          </button>
          <button
            onClick={() => setActiveTab("findings")}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "findings"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Findings & Contributions
          </button>
          <button
            onClick={() => setActiveTab("limitations")}
            className={`py-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "limitations"
                ? "border-slate-900 text-slate-900 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Limitations & Gaps
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {isLoading ? (
            /* CLEAN LOADING STATE */
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Reading the paper…</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Extracting the methods, findings, and limitations from available source material.
              </p>
            </div>
          ) : error ? (
            /* ERROR STATE */
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-900">Analysis unavailable</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                We couldn&apos;t analyze this paper right now. The original paper information is still available.
              </p>
              <button
                onClick={() => fetchAnalysis(true)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Try again
              </button>
            </div>
          ) : analysis ? (
            /* ACTIVE TAB CONTENT */
            <div className="space-y-6 text-sm text-slate-700">
              {activeTab === "summary" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Executive Research Summary
                    </h4>
                    <p className="text-slate-800 leading-relaxed text-sm bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Key Takeaway Points
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {analysis.keyPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "methodology" && (
                <div className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">Research Approach</span>
                      <p className="text-xs font-semibold text-slate-900">{analysis.methodology.approach}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">Dataset / Source</span>
                      <p className="text-xs text-slate-800">
                        {analysis.methodology.dataset || "Not explicitly specified in available text"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Methods & Algorithms
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.methodology.methods.map((m, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-xs font-mono text-slate-800">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {analysis.methodology.experimentalSetup && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                        Experimental Setup
                      </h4>
                      <p className="text-xs text-slate-700 bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                        {analysis.methodology.experimentalSetup}
                      </p>
                    </div>
                  )}

                  {analysis.methodology.evaluationMetrics.length > 0 && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                        Evaluation Metrics
                      </h4>
                      <p className="text-xs text-slate-600 font-mono">
                        {analysis.methodology.evaluationMetrics.join(" · ")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "findings" && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Main Empirical Findings
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-800">
                      {analysis.findings.mainFindings.map((f, i) => (
                        <li key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 leading-relaxed">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Novel Contributions
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {analysis.findings.contributions.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-slate-400 font-bold">·</span>
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === "limitations" && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <span>Authors&apos; Stated Limitations</span>
                    </h4>
                    {analysis.limitations.authorStated.length > 0 ? (
                      <ul className="space-y-2 text-xs text-slate-700">
                        {analysis.limitations.authorStated.map((lim, i) => (
                          <li key={i} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-amber-950">
                            {lim}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 italic">No specific limitations acknowledged in available text.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                      Potential Inferred Limitations
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {analysis.limitations.inferred.map((inf, i) => (
                        <li key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-700">
                          <span className="font-semibold text-slate-800">[Inference] </span>
                          {inf}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysis.researchGaps && analysis.researchGaps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                        Evidence-Supported Research Gaps
                      </h4>
                      <div className="space-y-3">
                        {analysis.researchGaps.map((gap, i) => (
                          <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                            <p className="font-semibold text-slate-900">{gap.gap}</p>
                            <p className="text-slate-500 italic">Evidence: {gap.evidence}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/40">
          <span>AI Research Intelligence · Prompt {analysis?.promptVersion || "v1"}</span>
          <button
            onClick={() => fetchAnalysis(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>
    </div>
  );
}
