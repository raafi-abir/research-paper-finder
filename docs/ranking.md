# Research Relevance & Ranking Engine (Phase 4)

## 1. Architecture Overview

PaperScout's Relevance & Ranking Engine evaluates candidate papers from academic sources (such as OpenAlex) against a user's multidimensional research profile.

```text
User Profile (Interests, Context, Goals, Field)
                   │
                   ▼
┌───────────────────────────────────────────────────────────┐
│                 Candidate Papers (OpenAlex)               │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                 Multifactor Scoring Engine                │
│                                                           │
│  1. Interest Match Scorer (35%)                           │
│  2. Topic & Keyword Density Scorer (25%)                  │
│  3. Free-form Research Context Scorer (15%)               │
│  4. Research Intent & Goal Scorer (10%)                   │
│  5. Publication Recency Exponential Decay (10%)           │
│  6. Logarithmic Citation Impact Signal (5%)               │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│                 Score & Explanation Synthesis             │
│                                                           │
│  - Normalized Composite Score: 0–100                      │
│  - Relevance Tier: HIGHLY_RELEVANT, RELEVANT, etc.        │
│  - Deterministic Explainer: "Why you're seeing this"      │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│               Topic Diversity & Re-Ranking                │
│                                                           │
│  - Interleaves diverse topics across the top feed         │
│  - Deterministic tie-breaking (Date DESC, Citations DESC) │
└──────────────────────────┬────────────────────────────────┘
                           │
                           ▼
┌───────────────────────────────────────────────────────────┐
│           Personalized Dashboard Feed (/dashboard)       │
└───────────────────────────────────────────────────────────┘
```

**Key Principle**: Relevance is **user-specific** ($\text{User} \times \text{Paper}$), dynamic, explainable, and deterministic without requiring expensive external LLMs or vector databases.

---

## 2. Mathematical Scoring Formula

The overall relevance score $S \in [0, 100]$ is computed as the linear combination of six normalized sub-scores $s_i \in [0, 100]$:

$$S = \sum_{i=1}^{6} w_i \cdot s_i$$

Where the weights $w_i$ sum to $1.0$:

$$\begin{aligned}
S = \; & 0.35 \cdot s_{\text{interest}} \\
+ \; & 0.25 \cdot s_{\text{topic}} \\
+ \; & 0.15 \cdot s_{\text{context}} \\
+ \; & 0.10 \cdot s_{\text{goal}} \\
+ \; & 0.10 \cdot s_{\text{recency}} \\
+ \; & 0.05 \cdot s_{\text{citation}}
\end{aligned}$$

---

## 3. Signal Details & Formulations

### Signal 1: Interest Match ($s_{\text{interest}}$, 35% weight)
- Evaluates explicit relationships created in PostgreSQL (`PaperInterest`) and full exact interest phrase matches in title/abstract.
- **Formulation**:
  $$s_{\text{interest}} = \min\left(100, \, 35 + \min(25 \cdot k, 60) + 30 \cdot \frac{k}{N}\right)$$
  where $k$ is the number of user interests matched and $N$ is the user's total interest count.
- **Property**: Matching 1 interest yields a solid score ($\approx 70$), matching 2 yields $\approx 88$, matching 3+ yields $\approx 96\text{--}100$.

### Signal 2: Topic & Keyword Match ($s_{\text{topic}}$, 25% weight)
- Tokenizes title and abstract with stop-word filtering and morphological suffix stemming (`stemWord`).
- Computes stemmed token and multi-word phrase coverage per interest:
  $$s_{\text{topic}} = 0.60 \cdot s_{\text{best}} + 0.25 \cdot s_{\text{second}} + 0.15 \cdot s_{\text{third}} + \text{fieldBonus}$$
- Title exact phrase matches receive high-confidence boosts up to 90.

### Signal 3: Research Context Overlap ($s_{\text{context}}$, 15% weight)
- Compares user's free-form contextual description (e.g., *"I'm interested in machine learning applications in power systems, especially dynamic stability"*) against candidate title + abstract.
- Baseline of $60$ if context is not specified by the user.

### Signal 4: Research Goal Alignment ($s_{\text{goal}}$, 10% weight)
- Deterministic heuristic mapping:
  - *"Find thesis ideas"* / *"Discover research gaps"*: Boosts papers highlighting limitations, future work, challenges, or novel frameworks ($\ge 85$).
  - *"Find project ideas"*: Boosts applied, prototype, experimental, or implementation papers.
  - *"Stay updated with research"*: Prioritizes recent surveys and year-over-year breakthrough publications.

### Signal 5: Publication Recency ($s_{\text{recency}}$, 10% weight)
- Continuous exponential half-life decay function:
  $$s_{\text{recency}} = s_{\text{min}} + (s_{\text{max}} - s_{\text{min}}) \cdot 2^{-\frac{\Delta t}{t_{\text{half}}}}$$
  where $t_{\text{half}} = 365\text{ days}$, $s_{\text{min}} = 25$, and $s_{\text{max}} = 100$.
- **Behavior**: Today's papers score $100$, 1-year-old papers score $\approx 62.5$, 3-year-old papers score $\approx 34$, and baseline is capped at $25$ so classic landmark papers remain discoverable.

### Signal 6: Citation Signal ($s_{\text{citation}}$, 5% weight)
- Logarithmic compression so highly cited papers provide a signal without distorting relevance:
  $$s_{\text{citation}} = \max\left(40, \, \min\left(100, \, \frac{\ln(1 + C)}{\ln(1 + C_{\text{benchmark}})} \times 100\right)\right)$$
  where $C_{\text{benchmark}} = 500$.
- Baseline of $40$ prevents new uncited papers from receiving punitive scores.

---

## 4. Relevance Tiers & Thresholds

| Score Range | Tier Enum | UI Label | Visual Style |
| :--- | :--- | :--- | :--- |
| **90 – 100** | `HIGHLY_RELEVANT` | Highly relevant | Subtle emerald badge (`bg-emerald-50 text-emerald-800`) |
| **75 – 89** | `RELEVANT` | Relevant | Subtle slate badge (`bg-slate-100 text-slate-800`) |
| **60 – 74** | `POTENTIALLY_RELEVANT` | Potentially relevant | Light slate badge (`bg-slate-50 text-slate-600`) |
| **< 60** | `LOW_RELEVANCE` | Low relevance | Filtered out of primary highlights |

---

## 5. Topic Diversity Algorithm

To prevent a single heavily published interest (e.g. *Power Systems*) from dominating the top 5 spots of the user's feed, PaperScout applies **topic interleaving**:

1. Identifies the primary matched interest for each candidate.
2. Tracks consecutive occurrences of the same topic.
3. If more than 2 consecutive papers originate from the same topic, the algorithm looks ahead in the candidate pool for a paper from a diverse user topic that has a score within 8 points ($\le 8\text{ delta}$).
4. Interleaves the diverse paper into the next feed position.

---

## 6. Deterministic Explanations

Each paper card provides a transparent *"Why you're seeing this"* block explaining the top signals:

- **Example 1**: *"Matches your research interests in Power Systems and Smart Grid, closely overlaps with your specific research focus, and published recently with up-to-date findings."*
- **Example 2**: *"Directly aligned with your interest in Renewable Energy and frequently referenced in current literature (45 citations)."*

---

## 7. API Reference

### `GET /api/research/ranked`
Returns personalized ranked papers for a user.

#### Query Parameters:
- `email` (string, optional): User email (defaults to active user session).
- `limit` (integer, default: 20): Results per page.
- `offset` (integer, default: 0): Pagination offset.
- `sort` (string, optional): `"relevance"` (default), `"recent"`, or `"cited"`.
- `interest` (string, optional): Filter by interest topic slug or name.

#### Example Response:
```json
{
  "success": true,
  "source": "ranking_engine",
  "total": 35,
  "count": 10,
  "papers": [
    {
      "id": "c6a1e944-...",
      "number": "01",
      "title": "Physics-Informed Neural Networks for Power System State Estimation",
      "publication": "IEEE Transactions on Power Systems",
      "date": "May 12, 2024",
      "citationCount": 42,
      "relevanceScore": 94,
      "relevanceLevel": "HIGHLY_RELEVANT",
      "relevanceLabel": "Highly relevant",
      "explanation": "Matches your research interests in Power Systems and Smart Grid, closely overlaps with your specific research focus, and published recently with up-to-date findings.",
      "scoreBreakdown": {
        "interestMatch": 96,
        "topicMatch": 92,
        "researchContext": 94,
        "researchGoal": 90,
        "recency": 94,
        "citationSignal": 72
      },
      "matchedInterests": ["Power Systems", "Smart Grid"]
    }
  ]
}
```

---

## 8. Why Deterministic Scoring in Phase 4?

1. **Explainable & Trustworthy**: Users understand why each paper appears in their feed rather than receiving black-box recommendations.
2. **Zero Latency & Low Cost**: Instant sub-millisecond execution without API costs or rate-limiting from commercial LLMs.
3. **Deterministic & Testable**: Reproducible scores allow rigorous automated unit testing and quality benchmarks.

---

## 9. Future Roadmap (Phase 5+)

- **Dense Embedding Semantic Similarity**: Replace keyword token overlap with embeddings (e.g., text-embedding-3 or local embeddings) for cross-lingual and conceptual matches.
- **LLM Deep Analysis**: Generate individualized summaries explaining specific methodological contributions and research gaps.
- **Implicit Feedback Loops**: Adapt interest weights as users save, read, or dismiss papers.
