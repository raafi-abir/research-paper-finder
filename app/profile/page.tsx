"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ACADEMIC_FIELDS } from "@/lib/mockData";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, ArrowRight, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [selectedField, setSelectedField] = useState<string>("Electrical & Electronic Engineering");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Power Systems",
    "Renewable Energy",
    "Power Electronics",
    "Smart Grid",
  ]);
  const [contextText, setContextText] = useState<string>(
    "I'm interested in machine learning applications in power systems, especially fault detection, renewable energy integration, and smart grids."
  );
  const [researchLevel, setResearchLevel] = useState<string>("GRADUATE");
  const [deliveryFrequency, setDeliveryFrequency] = useState<string>("EVERY_3_DAYS");
  const [papersPerDigest, setPapersPerDigest] = useState<number>(5);
  const [email, setEmail] = useState<string>("alex.chen@university.edu");

  const activeFieldData = ACADEMIC_FIELDS.find((f) => f.name === selectedField) || ACADEMIC_FIELDS[0];

  const toggleInterest = (topic: string) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter((t) => t !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    try {
      // Map interest names to slugs
      const interestSlugs = selectedInterests.map((name) =>
        name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      );

      const payload = {
        email,
        name: email.split("@")[0] || "PaperScout User",
        academicField: selectedField,
        researchLevel,
        researchContext: contextText,
        deliveryFrequency,
        papersPerDigest,
        interestSlugs: interestSlugs.length > 0 ? interestSlugs : ["power-systems"],
      };

      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn("Could not save to API endpoint, progressing with frontend state:", err);
    } finally {
      setIsSubmitting(false);
      setIsCompleted(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 my-10">
        <div className="w-full max-w-xl bg-white border border-slate-200/80 rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
          {!isCompleted ? (
            <>
              {/* Header Step Counter */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-semibold text-slate-400 font-mono">
                  STEP 0{step} / 04
                </span>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        s === step
                          ? "w-6 bg-slate-900"
                          : s < step
                          ? "w-2 bg-slate-400"
                          : "w-2 bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* STEP 1: FIELD OF STUDY */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      What are you studying?
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Start with your primary academic field.
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {ACADEMIC_FIELDS.map((field) => {
                      const isSelected = selectedField === field.name;
                      return (
                        <button
                          key={field.id}
                          type="button"
                          onClick={() => setSelectedField(field.name)}
                          className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "border-slate-900 bg-slate-50 text-slate-900 shadow-2xs"
                              : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          <span>{field.name}</span>
                          {isSelected && <Check className="w-4 h-4 text-slate-900" />}
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    variant="primary"
                    className="w-full py-3 mt-4"
                    onClick={() => setStep(2)}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* STEP 2: INTERESTS MULTI-SELECT */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      What are you interested in?
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Choose the areas you&apos;d like PaperScout to keep an eye on.
                    </p>
                  </div>

                  <div className="space-y-6 max-h-[380px] overflow-y-auto pr-2">
                    {activeFieldData.categories.map((cat) => (
                      <div key={cat.name} className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-400 font-mono">
                          {cat.name}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cat.topics.map((topic) => {
                            const isSelected = selectedInterests.includes(topic);
                            return (
                              <button
                                key={topic}
                                type="button"
                                onClick={() => toggleInterest(topic)}
                                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                                    : "bg-slate-50/80 text-slate-700 border-slate-200/80 hover:border-slate-300"
                                }`}
                              >
                                {topic}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="w-1/3 py-3"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      className="w-2/3 py-3"
                      onClick={() => setStep(3)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: CONTEXT & LEVEL */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      Tell us what you&apos;re curious about.
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      A little context helps us find research that&apos;s actually relevant to you.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      RESEARCH CONTEXT & FOCUS
                    </label>
                    <textarea
                      rows={4}
                      value={contextText}
                      onChange={(e) => setContextText(e.target.value)}
                      placeholder="I'm interested in machine learning applications in power systems..."
                      className="w-full p-3.5 bg-white border border-slate-300/80 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      YOUR RESEARCH LEVEL
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { label: "Undergraduate", value: "UNDERGRADUATE" },
                        { label: "Graduate", value: "GRADUATE" },
                        { label: "PhD", value: "PHD" },
                        { label: "Researcher", value: "RESEARCHER" },
                        { label: "Professional", value: "PROFESSIONAL" },
                      ].map((item) => {
                        const isSelected = researchLevel === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setResearchLevel(item.value)}
                            className={`p-3 rounded-xl border text-xs font-medium text-center transition-all cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                                : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="w-1/3 py-3"
                      onClick={() => setStep(2)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      className="w-2/3 py-3"
                      onClick={() => setStep(4)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: DELIVERY PREFERENCES */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                      How should we keep you updated?
                    </h1>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      We&apos;ll send a digest when there&apos;s enough worth sharing.
                    </p>
                  </div>

                  {/* Delivery frequency */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      DELIVERY FREQUENCY
                    </label>
                    <div className="space-y-2.5">
                      {[
                        { value: "EVERY_2_DAYS", title: "Every 2 days", desc: "A more frequent pulse of new research." },
                        { value: "EVERY_3_DAYS", title: "Every 3 days", desc: "A balanced research digest." },
                        { value: "WEEKLY", title: "Weekly", desc: "A quieter overview." },
                      ].map((item) => {
                        const isSelected = deliveryFrequency === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setDeliveryFrequency(item.value)}
                            className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "border-slate-900 bg-slate-50 shadow-2xs"
                                : "border-slate-200/80 bg-white hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900">
                                {item.title}
                              </div>
                              <div className="text-xs text-slate-500">{item.desc}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-slate-900" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Papers per digest */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      PAPERS PER DIGEST
                    </label>
                    <div className="flex gap-3">
                      {[3, 5, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPapersPerDigest(num)}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                            papersPerDigest === num
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-700 border-slate-200/80 hover:border-slate-300"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Email address */}
                  <Input
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="w-1/3 py-3"
                      onClick={() => setStep(3)}
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      className="w-2/3 py-3 flex items-center justify-center gap-2"
                      onClick={handleFinish}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                        </>
                      ) : (
                        "Start my research feed"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* COMPLETION VIEW */
            <div className="text-center space-y-8 py-4">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 text-xs rounded-full uppercase tracking-wider">
                YOUR RESEARCH FEED IS READY
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  We&apos;ll take it from here.
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  PaperScout will keep watch over the research around your interests and surface what deserves your attention.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  MONITORED INTERESTS
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-md text-xs font-medium text-slate-800 shadow-2xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Your first digest will arrive soon via email.
              </p>

              <Button
                variant="primary"
                className="w-full py-3.5 flex items-center justify-center gap-2"
                onClick={() => router.push("/dashboard")}
              >
                Go to dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
