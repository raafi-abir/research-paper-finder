"use client";

import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PaperAnalysisModal } from "@/components/ai/PaperAnalysisModal";
import { PaperComparisonModal } from "@/components/ai/PaperComparisonModal";
import {
  ArrowUpRight,
  Bookmark,
  SlidersHorizontal,
  RefreshCw,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ArrowUpDown,
  Layers,
  Scale,
  FileText,
} from "lucide-react";

interface InterestItem {
  id?: string;
  name: string;
  slug: string;
  category?: string;
}

interface ScoreBreakdown {
  interestMatch: number;
  topicMatch: number;
  researchContext: number;
  researchGoal: number;
  recency: number;
  citationSignal: number;
}

interface PaperItem {
  id: string;
  number: string;
  title: string;
  abstract: string | null;
  authors: string[];
  publication: string | null;
  journal?: string | null;
  conference?: string | null;
  publicationDate: string | null;
  date: string | null;
  citationCount: number;
  doi: string | null;
  url: string | null;
  source?: string | null;
  externalId?: string | null;
  interests?: InterestItem[];
  relevanceScore?: number;
  relevanceLevel?: "HIGHLY_RELEVANT" | "RELEVANT" | "POTENTIALLY_RELEVANT" | "LOW_RELEVANCE";
  relevanceLabel?: string;
  explanation?: string;
  scoreBreakdown?: ScoreBreakdown;
  matchedInterests?: string[];
}

export default function DashboardPage() {
  const [papers, setPapers] = useState<PaperItem[]>([]);
  const [interests, setInterests] = useState<InterestItem[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [filterInterest, setFilterInterest] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"relevance" | "recent" | "cited">("relevance");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [discoveryNotification, setDiscoveryNotification] = useState<{
    type: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // Modals state
  const [activeAnalysisPaper, setActiveAnalysisPaper] = useState<{ id: string; title: string } | null>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);

  // Fetch user profile (interests) & ranked papers
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profile for interests
      const profileRes = await fetch("/api/profile");
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.profile?.interests) {
          setInterests(profileData.profile.interests);
        }
      }

      // 2. Fetch Ranked Papers
      const queryParams = new URLSearchParams();
      queryParams.set("sort", sortBy);
      if (filterInterest) queryParams.set("interest", filterInterest);

      const rankedRes = await fetch(`/api/research/ranked?${queryParams.toString()}`);
      if (rankedRes.ok) {
        const data = await rankedRes.json();
        if (Array.isArray(data.papers)) {
          setPapers(data.papers);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy, filterInterest]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Trigger OpenAlex discovery
  const handleDiscover = async () => {
    setIsDiscovering(true);
    setDiscoveryNotification(null);

    try {
      const res = await fetch("/api/research/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resultsPerInterest: 10 }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const summary = data.summary;
        const newCount = summary?.newPapersSaved ?? 0;
        const totalFound = summary?.papersFound ?? 0;

        setDiscoveryNotification({
          type: "success",
          title: "Research feed updated & ranked.",
          message:
            newCount > 0
              ? `We found and ranked ${newCount} new ${newCount === 1 ? "paper" : "papers"} for your profile.`
              : totalFound > 0
              ? `Searched ${summary.interestsProcessed} interests. All ${totalFound} papers ranked.`
              : "No new papers found for the selected interests at this time.",
        });

        // Refresh ranked feed
        loadData();
      } else {
        setDiscoveryNotification({
          type: "error",
          title: "Discovery could not complete",
          message: data.error || "Unable to reach the OpenAlex service. Please try again.",
        });
      }
    } catch {
      setDiscoveryNotification({
        type: "error",
        title: "Connection Error",
        message: "Failed to connect to the discovery endpoint.",
      });
    } finally {
      setIsDiscovering(false);
    }
  };

  const toggleSave = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const toggleComparisonSelection = (id: string) => {
    if (selectedForComparison.includes(id)) {
      setSelectedForComparison(selectedForComparison.filter((item) => item !== id));
    } else {
      if (selectedForComparison.length >= 5) {
        alert("You can compare a maximum of 5 papers simultaneously.");
        return;
      }
      setSelectedForComparison([...selectedForComparison, id]);
    }
  };

  // Filter papers by search query
  const filteredPapers = papers.filter((paper) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      paper.title.toLowerCase().includes(q) ||
      (paper.abstract && paper.abstract.toLowerCase().includes(q)) ||
      paper.authors.some((a) => a.toLowerCase().includes(q)) ||
      (paper.publication && paper.publication.toLowerCase().includes(q)) ||
      (paper.explanation && paper.explanation.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] relative">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-12 pb-24">
        {/* DASHBOARD HEADER */}
        <section className="space-y-6 pb-8 border-b border-slate-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>RESEARCH INTELLIGENCE & RANKING ACTIVE</span>
            </div>

            {/* ACTION: TRIGGER DISCOVERY */}
            <button
              onClick={handleDiscover}
              disabled={isDiscovering}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isDiscovering
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : "bg-white text-slate-900 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-2xs active:scale-[0.98]"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? "animate-spin text-slate-400" : "text-slate-600"}`} />
              <span>{isDiscovering ? "Searching OpenAlex…" : "Discover & rank research"}</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Good evening.
            </h1>
            <p className="text-base text-slate-600 font-normal">
              Here are research papers personalized to your interests, analyzed and ranked.
            </p>
          </div>

          {/* DISCOVERY NOTIFICATION BANNER */}
          {discoveryNotification && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                discoveryNotification.type === "success"
                  ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                  : "bg-red-50/70 border-red-200 text-red-900"
              }`}
            >
              {discoveryNotification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 text-xs">
                <p className="font-semibold">{discoveryNotification.title}</p>
                <p className="text-slate-600">{discoveryNotification.message}</p>
              </div>
            </div>
          )}

          {/* DISCOVERING / SEARCHING STATE */}
          {isDiscovering && (
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 animate-pulse">
              <div className="flex items-center gap-2 text-slate-900 text-sm font-semibold">
                <RefreshCw className="w-4 h-4 animate-spin text-slate-600" />
                <span>Looking through recent research…</span>
              </div>
              <p className="text-xs text-slate-500">
                Searching the academic literature around your interests.
              </p>
            </div>
          )}
        </section>

        {/* INTERESTS FILTER SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your research areas
              </h2>
              <p className="text-xs text-slate-500">
                Active topics queried against academic databases.
              </p>
            </div>
            <Link
              href="/profile"
              className="text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              Edit interests <SlidersHorizontal className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={() => setFilterInterest(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                filterInterest === null
                  ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              All topics ({papers.length})
            </button>
            {interests.map((interest) => {
              const isSelected = filterInterest === interest.slug || filterInterest === interest.name;
              return (
                <button
                  key={interest.slug || interest.name}
                  onClick={() => setFilterInterest(isSelected ? null : (interest.slug || interest.name))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {interest.name}
                </button>
              );
            })}
          </div>
        </section>

        {/* RESEARCH FEED SECTION */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Worth your attention
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by multi-factor personalized relevance to your profile. Select up to 5 papers to compare.
              </p>
            </div>

            {/* Controls: Search & Sort */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 shadow-2xs">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400 font-mono">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "relevance" | "recent" | "cited")}
                  aria-label="Sort research feed"
                  className="bg-transparent text-slate-900 font-medium focus:outline-none cursor-pointer"
                >
                  <option value="relevance">Personalized relevance</option>
                  <option value="recent">Most recent</option>
                  <option value="cited">Most cited</option>
                </select>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search papers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              // Initial Loading Skeleton
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 animate-pulse"
                  >
                    <div className="h-4 bg-slate-100 rounded w-1/4" />
                    <div className="h-6 bg-slate-100 rounded w-3/4" />
                    <div className="h-16 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => {
                const isSaved = savedIds.includes(paper.id);
                const isSelected = selectedForComparison.includes(paper.id);
                const score = paper.relevanceScore ?? 0;

                // Subtle Apple-like score badges
                const badgeClass =
                  score >= 90
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
                    : score >= 75
                    ? "bg-slate-100 text-slate-800 border-slate-200"
                    : "bg-slate-50 text-slate-600 border-slate-200/60";

                return (
                  <article
                    key={paper.id}
                    className={`bg-white border rounded-2xl p-6 md:p-8 space-y-5 shadow-2xs transition-all ${
                      isSelected
                        ? "border-slate-900 ring-1 ring-slate-900"
                        : "border-slate-200/80 hover:border-slate-300"
                    }`}
                  >
                    {/* Header line: Checkbox, Index, Calculated Relevance %, Date, Citations */}
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleComparisonSelection(paper.id)}
                          aria-label={`Select paper ${paper.title} for comparison`}
                          className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400 cursor-pointer"
                        />

                        <span className="font-mono text-slate-400 font-bold">
                          {paper.number}
                        </span>

                        {paper.relevanceScore !== undefined && (
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-semibold text-xs border ${badgeClass}`}
                          >
                            {paper.relevanceScore}% relevant
                          </span>
                        )}

                        {paper.citationCount !== undefined && paper.citationCount > 0 && (
                          <span className="text-slate-500 font-mono">
                            {paper.citationCount} {paper.citationCount === 1 ? "citation" : "citations"}
                          </span>
                        )}
                      </div>

                      {paper.date && (
                        <span className="text-slate-400 font-mono">{paper.date}</span>
                      )}
                    </div>

                    {/* Title & Publication info */}
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-semibold text-slate-900 leading-snug">
                        {paper.url ? (
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-700 transition-colors inline-flex items-center gap-1.5"
                          >
                            {paper.title}
                            <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 inline" />
                          </a>
                        ) : (
                          paper.title
                        )}
                      </h3>

                      <p className="text-xs text-slate-500">
                        {paper.publication && (
                          <span className="font-medium text-slate-700">{paper.publication} · </span>
                        )}
                        {paper.authors.length > 0 ? paper.authors.join(", ") : "Unknown authors"}
                      </p>
                    </div>

                    {/* WHY YOU'RE SEEING THIS (Phase 4 Transparent Explanation) */}
                    {paper.explanation && (
                      <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-100 space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-700 font-mono">
                          <Sparkles className="w-3 h-3 text-slate-500" />
                          <span>Why you&apos;re seeing this</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {paper.explanation}
                        </p>
                      </div>
                    )}

                    {/* Abstract (Reconstructed from OpenAlex) */}
                    {paper.abstract ? (
                      <div className="space-y-1">
                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                          Abstract
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 hover:line-clamp-none transition-all">
                          {paper.abstract}
                        </p>
                      </div>
                    ) : null}

                    {/* Footer: AI Actions (Analyze), DOI / External Link & Save */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3">
                        {/* Phase 5 Action: AI Deep Analysis */}
                        <button
                          type="button"
                          onClick={() => setActiveAnalysisPaper({ id: paper.id, title: paper.title })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Analyze paper</span>
                        </button>

                        {paper.doi ? (
                          <a
                            href={`https://doi.org/${paper.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <span>doi:{paper.doi}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : paper.url ? (
                          <a
                            href={paper.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <span>View record</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400 font-mono">OpenAlex record</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSave(paper.id)}
                          className={`inline-flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                            isSaved
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                          {isSaved ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              /* EMPTY STATE */
              <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-2xs">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Nothing new found.
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    We couldn&apos;t find papers matching your current interests. Try triggering discovery or adding another research area.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={handleDiscover}
                    disabled={isDiscovering}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Discover research now
                  </button>
                  <Link
                    href="/profile"
                    className="px-4 py-2 bg-white text-slate-700 border border-slate-200 text-xs font-medium rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Update interests
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* FLOATING COMPARISON BAR (When papers are selected) */}
      {selectedForComparison.length > 0 && (
        <aside
          aria-label="Paper comparison selection"
          className="fixed bottom-6 inset-x-0 mx-auto max-w-lg z-40 bg-slate-900 text-white p-4 px-6 rounded-2xl shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom-6 duration-200 border border-slate-800"
        >
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-mono font-bold text-white">
              {selectedForComparison.length}
            </span>
            <span className="font-medium">
              {selectedForComparison.length === 1 ? "paper selected" : "papers selected"} (max 5)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedForComparison([])}
              className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => setIsComparisonOpen(true)}
              className="px-4 py-2 bg-white text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare {selectedForComparison.length} papers</span>
            </button>
          </div>
        </aside>
      )}

      {/* PAPER ANALYSIS MODAL */}
      <PaperAnalysisModal
        paperId={activeAnalysisPaper?.id || null}
        paperTitle={activeAnalysisPaper?.title}
        isOpen={activeAnalysisPaper !== null}
        onClose={() => setActiveAnalysisPaper(null)}
      />

      {/* PAPER COMPARISON MODAL */}
      <PaperComparisonModal
        paperIds={selectedForComparison}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />

      <Footer />
    </div>
  );
}



