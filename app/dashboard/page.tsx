"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  MOCK_PAPERS,
  MOCK_EMERGING_TOPICS,
  MOCK_RESEARCH_GAPS,
  INITIAL_USER_INTERESTS,
  Paper,
} from "@/lib/mockData";
import { ArrowUpRight, Bookmark, CheckCircle2, SlidersHorizontal, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [papers, setPapers] = useState<Paper[]>(MOCK_PAPERS);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [filterInterest, setFilterInterest] = useState<string | null>(null);

  const toggleSave = (id: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id));
    } else {
      setSavedIds([...savedIds, id]);
    }
  };

  const filteredPapers = filterInterest
    ? papers.filter((p) =>
        p.title.toLowerCase().includes(filterInterest.toLowerCase()) ||
        p.whyItMatters.toLowerCase().includes(filterInterest.toLowerCase())
      )
    : papers;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-16">
        {/* DASHBOARD HEADER */}
        <section className="space-y-4 pb-8 border-b border-slate-200/80">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>RESEARCH MONITORING ACTIVE</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Good evening.
            </h1>
            <p className="text-base text-slate-600 font-normal">
              Here&apos;s what&apos;s worth knowing.
            </p>
          </div>

          {/* MOCK MONITORING PULSE STATS */}
          <div className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 font-mono border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-slate-400" />
              Last checked · Today, 8:30 PM
            </span>
            <span>·</span>
            <span>23 papers reviewed</span>
            <span>·</span>
            <span>6 matched your interests</span>
            <span>·</span>
            <span className="text-slate-900 font-medium">3 selected for next digest</span>
          </div>
        </section>

        {/* INTERESTS SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your research
              </h2>
              <p className="text-xs text-slate-500">
                PaperScout is currently watching these areas.
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
              All topics
            </button>
            {INITIAL_USER_INTERESTS.map((interest) => {
              const isSelected = filterInterest === interest;
              return (
                <button
                  key={interest}
                  onClick={() => setFilterInterest(isSelected ? null : interest)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </section>

        {/* RESEARCH FEED SECTION */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Worth your attention
            </h2>
            <p className="text-xs text-slate-500">
              Papers PaperScout thinks are worth opening.
            </p>
          </div>

          <div className="space-y-8">
            {filteredPapers.length > 0 ? (
              filteredPapers.map((paper) => {
                const isSaved = savedIds.includes(paper.id);
                return (
                  <article
                    key={paper.id}
                    className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xs transition-all hover:border-slate-300"
                  >
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm text-slate-400 font-bold">
                          {paper.number}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80">
                          {paper.relevanceScore}% relevant
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{paper.date}</span>
                    </div>

                    {/* Title & Metadata */}
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 leading-snug">
                        {paper.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5">
                        {paper.publication} · {paper.authors.join(", ")}
                      </p>
                    </div>

                    {/* Three Breakdown Blocks */}
                    <div className="grid md:grid-cols-3 gap-4 pt-2">
                      <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-100 space-y-1.5">
                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                          Why this matters
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {paper.whyItMatters}
                        </p>
                      </div>

                      <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-100 space-y-1.5">
                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                          In brief
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {paper.inBrief}
                        </p>
                      </div>

                      <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-100 space-y-1.5">
                        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                          Research opportunity
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {paper.researchOpportunity}
                        </p>
                      </div>
                    </div>

                    {/* Action links */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <a
                        href="#"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-blue-700 transition-colors"
                      >
                        Read analysis <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => toggleSave(paper.id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                          isSaved
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        {isSaved ? "Saved" : "Save"}
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              /* EMPTY STATE */
              <div className="p-12 text-center bg-white border border-slate-200/80 rounded-2xl space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">Nothing new yet.</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  We&apos;re watching your research areas. When something genuinely relevant appears, it&apos;ll show up here.
                </p>
                <div className="pt-2">
                  <span className="inline-block text-xs font-mono text-slate-400 bg-slate-100 px-3 py-1 rounded-md">
                    Monitoring active
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* EMERGING TOPICS SECTION */}
        <section className="space-y-4 pt-4 border-t border-slate-200/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Emerging in your fields
            </h2>
            <p className="text-xs text-slate-500">
              Topics appearing more frequently across the research you&apos;re following.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl divide-y divide-slate-100">
            {MOCK_EMERGING_TOPICS.map((topic) => (
              <div
                key={topic.id}
                className="p-4 md:px-6 flex items-center justify-between text-sm hover:bg-slate-50/60 transition-colors"
              >
                <span className="font-medium text-slate-900">{topic.title}</span>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {topic.trend}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* RESEARCH GAPS SECTION */}
        <section className="space-y-4 pt-4 border-t border-slate-200/80">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Worth exploring
            </h2>
            <p className="text-xs text-slate-500">
              Patterns we&apos;re seeing across recent research.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {MOCK_RESEARCH_GAPS.map((gap) => (
              <div
                key={gap.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-900 leading-snug">
                    {gap.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {gap.description}
                  </p>
                </div>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-900 hover:text-blue-700 transition-colors pt-2"
                >
                  {gap.linkText}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* NEXT DIGEST SCHEDULE STATUS */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              YOUR NEXT DIGEST
            </span>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Thursday, August 13 · 8:00 PM
            </h3>
            <p className="text-xs text-slate-300">
              We&apos;ll send it when there&apos;s something worth reading.
            </p>
          </div>

          <button
            type="button"
            className="text-xs font-medium border border-slate-700 hover:bg-slate-800 text-slate-200 px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Manage delivery →
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
