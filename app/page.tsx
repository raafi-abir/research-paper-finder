import Link from "next/link";
import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DigestPreview } from "@/components/landing/DigestPreview";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
          <div className="inline-block px-3 py-1 bg-slate-200/60 rounded-full text-slate-700 text-xs font-semibold uppercase tracking-widest mb-6">
            PERSONAL RESEARCH INTELLIGENCE
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
            Research shouldn&apos;t require <br className="hidden sm:inline" />
            <span className="text-slate-900">constant searching.</span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
            PaperScout keeps watch over the research around your interests and brings you the papers, ideas, and discoveries worth your attention.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-slate-900 text-white font-medium px-7 py-3.5 rounded-lg hover:bg-slate-800 transition-all text-sm shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Start your research feed <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto text-slate-700 font-medium px-5 py-3.5 hover:text-slate-900 text-sm transition-colors flex items-center justify-center gap-1"
            >
              See how it works →
            </a>
          </div>

          {/* HERO DIGEST PREVIEW */}
          <div className="mt-8">
            <DigestPreview />
          </div>
        </section>

        {/* SECTION: HOW IT WORKS */}
        <section id="how-it-works" className="py-24 px-6 border-t border-slate-200/60 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                HOW PAPER SCOUT WORKS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Set your interests once. <br />
                We&apos;ll watch from there.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="space-y-4 p-6 bg-[#FAFAFA] rounded-2xl border border-slate-200/70">
                <span className="font-mono text-sm text-slate-400 font-bold">01</span>
                <h3 className="text-lg font-semibold text-slate-900">Tell us what you care about</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Choose your field, research interests, and what you want to learn more about.
                </p>
              </div>

              <div className="space-y-4 p-6 bg-[#FAFAFA] rounded-2xl border border-slate-200/70">
                <span className="font-mono text-sm text-slate-400 font-bold">02</span>
                <h3 className="text-lg font-semibold text-slate-900">We keep watch</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  PaperScout continuously monitors academic research around your interests.
                </p>
              </div>

              <div className="space-y-4 p-6 bg-[#FAFAFA] rounded-2xl border border-slate-200/70">
                <span className="font-mono text-sm text-slate-400 font-bold">03</span>
                <h3 className="text-lg font-semibold text-slate-900">Get the signal</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Every few days, receive a concise digest of the papers and research opportunities worth your time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: VALUE */}
        <section className="py-24 px-6 border-t border-slate-200/60 bg-[#FAFAFA]">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Less searching. More discovering.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">Stay current</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Keep up with meaningful developments in your field without spending hours searching for them.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">Understand faster</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Get the important findings, methodology, and limitations without having to read every paper cover to cover.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-900">See what&apos;s next</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Discover research gaps and potential directions hidden inside the latest work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: RESEARCH INTEREST EXAMPLE */}
        <section id="research-example" className="py-24 px-6 border-t border-slate-200/60 bg-white">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                Built around what you&apos;re curious about.
              </h2>
              <p className="text-sm text-slate-500">
                PaperScout learns what matters to you — and filters the literature accordingly.
              </p>
            </div>

            <div className="p-8 md:p-10 bg-[#FAFAFA] border border-slate-200/80 rounded-2xl text-left max-w-2xl mx-auto space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  EXAMPLE RESEARCH PROFILE
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Electrical & Electronic Engineering
                </h3>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-500">SELECTED INTERESTS</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Power Systems",
                    "Renewable Energy",
                    "Power Electronics",
                    "Smart Grid",
                    "Semiconductor Devices",
                    "Energy Storage",
                  ].map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-800 shadow-2xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-900" />
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL LANDING CTA */}
        <section className="py-24 px-6 border-t border-slate-200/60 bg-[#FAFAFA] text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Let research come to you.
            </h2>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed">
              Build your research feed in a few minutes and let PaperScout keep watch.
            </p>
            <div>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-slate-900 text-white font-medium px-8 py-4 rounded-lg hover:bg-slate-800 transition-all text-sm shadow-sm active:scale-[0.98]"
              >
                Create your research feed <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Free during the early access period.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
