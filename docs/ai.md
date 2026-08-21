# AI Research Intelligence (Phase 5)

## 1. Architecture Overview

PaperScout's AI Research Intelligence layer turns academic papers into structured, verifiable insights.

```text
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server Layer                     │
│                                                             │
│  API Endpoints:                                             │
│  - POST /api/ai/papers/[id]/summarize                       │
│  - POST /api/ai/papers/[id]/analyze                         │
│  - POST /api/ai/compare                                     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 AI Services Layer                           │
│                                                             │
│  - PaperAnalysisService (Summarization, Deep Analysis)      │
│  - PaperComparisonService (Multi-Paper Synthesis)           │
│  - Caching & Persistence in PostgreSQL (PaperAnalysis)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               Versioned Prompts & Schemas (v1)              │
│                                                             │
│  - Zod Validation Schemas (Summary, Analysis, Comparison)   │
│  - Anti-Hallucination Guardrails                            │
│  - Separation of Author-Stated vs Inferred Limitations      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  AI Provider Abstraction                    │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ Gemini Provider │  │ OpenAI Provider │  │    Mock     │  │
│  │ (Gemini 1.5)    │  │ (GPT-4o-mini)   │  │ (Dev/Test)  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Provider Abstraction

All AI requests flow through the unified `AIProvider` interface:

```typescript
export interface AIProvider {
  name: string;
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemPrompt?: string
  ): Promise<T>;
}
```

The active provider is chosen dynamically by the factory in `lib/ai/client.ts`.

### Environment Configuration:
Add to `.env`:

```env
# AI Provider Selection: "mock" | "gemini" | "openai"
AI_PROVIDER=mock

# Model selection (optional, default: gemini-1.5-flash or gpt-4o-mini)
AI_MODEL=gemini-1.5-flash

# API Credentials (never exposed to client/browser)
AI_API_KEY=your-api-key-here
```

---

## 3. Core AI Capabilities

### 1. Paper Summarization (`summarizePaper`)
- Produces a concise **100–180 word research summary** answering:
  - What problem does the paper address?
  - What approach does it take?
  - What is the primary empirical result?
  - Why does it matter?
- Generates 3–5 bulleted takeaway points.

### 2. Deep Paper Analysis (`analyzePaper`)
Extracts a structured scientific breakdown:
- **Methodology**:
  - `approach`: Broad paradigm (e.g. Simulation, Experimental, Machine Learning)
  - `methods`: Specific algorithms/architectures
  - `dataset`: Dataset name, size, or `null` if unstated
  - `experimentalSetup`: Hardware/simulation setup
  - `evaluationMetrics`: Benchmark metrics (RMSE, accuracy, convergence time)
- **Findings**:
  - `mainFindings`: Empirical and theoretical results
  - `contributions`: Specific novel contributions
- **Limitations (Strict Separation)**:
  - `authorStated`: Weaknesses acknowledged by the authors
  - `inferred`: Methodological constraints inferred from the experimental scope
- **Research Gaps**:
  - Concrete open challenges paired with evidence from the paper.

### 3. Multi-Paper Synthesis (`comparePapers`, up to 5 papers)
Cross-analyzes up to 5 papers to produce:
- **Collective Synthesis Overview**: How the papers interconnect within the field.
- **Common Themes**: Shared questions and research objectives.
- **Methodological Comparison Table**: Clean matrix with Approach, Methods, Main Finding, and Limitations.
- **Trade-offs & Differences**: Comparing physics-informed vs data-driven vs analytical paradigms.
- **Consensus vs Disagreement**: Where the findings agree and where methodologies conflict.
- **Collective Research Gaps & Future Directions**: Highlighting high-impact unexplored opportunities.

---

## 4. Anti-Hallucination Guardrails

1. **Strict Source Grounding**: The AI is instructed never to invent numerical benchmarks, authors' claims, or experimental setups.
2. **Explicit Uncertainty**: Missing details are stored as `null` or explicitly noted as *"Not specified in available text"*.
3. **Limitation Classification**: Inferred limitations are strictly separated from author-stated limitations.
4. **Source Material Transparency**: Analyses carry an `analysisSource` tag (`FULL_TEXT`, `ABSTRACT`, or `METADATA`).

---

## 5. Caching & Cost Management

- **Zero Unnecessary AI Calls**: Papers are only analyzed on demand (when requested by the user).
- **Persistent Cache**: Results are stored in the PostgreSQL `PaperAnalysis` table with prompt versioning (`promptVersion: "v1"`).
- Subsequent opens of the paper immediately load the cached analysis from the database without re-calling external LLM APIs.

---

## 6. API Reference

### `POST /api/ai/papers/:id/summarize`
Generates or retrieves a cached research summary.

### `POST /api/ai/papers/:id/analyze`
Generates or retrieves a cached deep analysis.

### `POST /api/ai/compare`
Compares 1 to 5 papers.
```json
{
  "paperIds": [
    "paper-uuid-1",
    "paper-uuid-2",
    "paper-uuid-3"
  ]
}
```

---

## 7. UI Integration

- **Apple-Inspired Restraint**: Subtle modals and drawers styled with slate neutrals (`#FAFAFA`, slate-900, slate-100). Zero neon gradients or AI sparkles.
- **Floating Comparison Bar**: Appears when checkboxes are selected on feed items.
- **Responsive Table**: Formats as a comparison matrix on desktop and stacks on mobile screens.
