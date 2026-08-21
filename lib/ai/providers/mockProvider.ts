// lib/ai/providers/mockProvider.ts
import { z } from "zod";
import {
  AIProvider,
  PaperSummary,
  PaperAnalysisResult,
  PaperComparisonResult,
} from "../types";

/**
 * High-fidelity, deterministic Mock AI Provider for offline testing and development.
 * Produces structured academic intelligence based on input paper metadata.
 */
export class MockAIProvider implements AIProvider {
  name = "mock";

  async generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    _systemPrompt?: string
  ): Promise<T> {
    // Determine request type from prompt content
    if (prompt.includes("PAPER TO SUMMARIZE:")) {
      const summaryData = this.generateMockSummary(prompt);
      return schema.parse(summaryData);
    }

    if (prompt.includes("PAPER TO ANALYZE:")) {
      const analysisData = this.generateMockAnalysis(prompt);
      return schema.parse(analysisData);
    }

    if (prompt.includes("PAPERS TO COMPARE:")) {
      const comparisonData = this.generateMockComparison(prompt);
      return schema.parse(comparisonData);
    }

    // Default fallback structured object
    const fallback = {
      summary: "Academic synthesis based on available research literature.",
      keyPoints: [
        "Identifies key methodological frameworks within the target domain.",
        "Evaluates performance under realistic operational parameters.",
        "Highlights existing experimental boundaries and validation scope.",
      ],
    };
    return schema.parse(fallback);
  }

  private extractTitleFromPrompt(prompt: string): string {
    const match = prompt.match(/Title:\s*(.+)/i);
    return match ? match[1].trim() : "Research Study";
  }

  private generateMockSummary(prompt: string): PaperSummary {
    const title = this.extractTitleFromPrompt(prompt);
    const hasAbstract = prompt.includes("Abstract:") && !prompt.includes("No abstract text available");

    return {
      summary: hasAbstract
        ? `This work investigates advanced data-driven and analytical techniques in the context of ${title}. The authors formulate a structured framework to improve operational precision, evaluate performance against established baseline models, and demonstrate increased robustness under variable experimental conditions.`
        : `This paper presents research on ${title}. Based on available metadata, the study focuses on algorithmic enhancements and system-level modeling within its respective academic domain.`,
      keyPoints: [
        `Formulates a dedicated methodological architecture for ${title.slice(0, 45)}...`,
        "Demonstrates empirical performance improvements over conventional benchmark methods.",
        "Evaluates sensitivity under measurement disturbances and dynamic operating scenarios.",
        hasAbstract
          ? "Findings are primarily validated through simulated and benchmark test systems."
          : "Analysis is derived from available publication metadata.",
      ],
    };
  }

  private generateMockAnalysis(prompt: string): PaperAnalysisResult {
    const title = this.extractTitleFromPrompt(prompt);
    const hasAbstract = prompt.includes("Abstract:") && !prompt.includes("No abstract text available");

    // Deduce domain keywords
    const isML = /neural|learning|ai|deep|data-driven/i.test(title);
    const isGrid = /grid|power|voltage|inverter|energy|microgrid/i.test(title);

    const approach = isML
      ? "Machine Learning & Neural Modeling"
      : isGrid
      ? "Simulation & Numerical Power-System Analysis"
      : "Theoretical & Experimental Investigation";

    const methods = isML
      ? ["Deep Neural Network Architecture", "Physics-Constrained Optimization", "Stochastic Gradient Descent"]
      : isGrid
      ? ["Dynamic Power Flow Formulation", "State Space Modeling", "Time-Domain Transient Simulation"]
      : ["Mathematical Modeling", "Comparative Benchmark Evaluation"];

    return {
      summary: `The paper presents a comprehensive study on ${title}, introducing structured modeling techniques to address core engineering constraints. The approach achieves notable gains in estimation accuracy and stability.`,
      keyPoints: [
        `Introduces a novel framework specifically tailored for ${title.slice(0, 40)}.`,
        "Reduces computational overhead while preserving operational accuracy.",
        "Compares empirical outcomes against traditional standard baselines.",
        "Highlights key architectural trade-offs under dynamic conditions.",
      ],
      methodology: {
        approach,
        methods,
        dataset: hasAbstract ? "IEEE Standard Benchmark Case Library (Simulated)" : null,
        experimentalSetup: hasAbstract ? "MATLAB/Simulink and Python numerical simulation environment" : null,
        evaluationMetrics: ["Root Mean Square Error (RMSE)", "Convergence Time (ms)", "Voltage Deviation"],
      },
      findings: {
        mainFindings: [
          "Demonstrates significant reduction in estimation error across standard test cases.",
          "Maintains numerical stability under moderate measurement noise and communication latency.",
          "Improves generalization capability across varied network operating points.",
        ],
        contributions: [
          "A novel formulation integrating domain constraints directly into the computational model.",
          "Rigorous comparative benchmark against classical state-of-the-art methods.",
        ],
      },
      limitations: {
        authorStated: [
          "Validation is currently conducted predominantly on synthetic benchmark test systems.",
          "High parameter sensitivity when operating under extreme boundary contingencies.",
        ],
        inferred: [
          "Real-world sensor noise and asynchronous packet drops may degrade practical performance.",
          "Scalability to ultra-large scale industrial networks remains to be empirically verified.",
        ],
      },
      researchGaps: [
        {
          gap: "Limited real-world physical hardware-in-the-loop (HIL) validation.",
          evidence: "Experiments were conducted exclusively in software simulation environments.",
        },
        {
          gap: "Adaptability to rapid topology reconfigurations in real-time.",
          evidence: "Test scenarios assume stationary network topologies during execution.",
        },
      ],
      analysisSource: hasAbstract ? "ABSTRACT" : "METADATA",
    };
  }

  private generateMockComparison(prompt: string): PaperComparisonResult {
    // Extract paper IDs from prompt
    const idMatches = prompt.matchAll(/ID:\s*([^\s\)]+)/g);
    const paperIds = Array.from(idMatches, (m) => m[1]);

    const comparisonItems = paperIds.map((id, index) => ({
      paperId: id,
      title: `Selected Research Paper ${index + 1}`,
      approach: index % 2 === 0 ? "Physics-Informed Neural Framework" : "Dynamic Numerical Simulation",
      methodology: index % 2 === 0 ? "Deep Learning with Physical Constraints" : "Time-Domain Transient Analysis",
      mainFinding: `Demonstrates ${15 + index * 5}% performance improvement under dynamic stress conditions.`,
      strengths: ["Strong theoretical formulation", "Robust against moderate noise"],
      limitations: ["Validated primarily in simulated environments", "Moderate training time"],
    }));

    return {
      overview:
        "The selected papers investigate advanced computational and analytical methodologies within modern power and electrical engineering. While they share the overarching objective of improving system visibility, stability, and control, they diverge in how physical domain constraints are integrated with data-driven models.",
      commonThemes: [
        "Enhancing operational robustness under high renewable penetration and measurement noise.",
        "Transitioning from purely analytical solvers to hybrid computational models.",
        "Scalability and computational efficiency during transient grid events.",
      ],
      comparison: comparisonItems,
      methodologicalDifferences: [
        "Physics-informed approaches incorporate differential equation constraints, whereas pure data-driven models rely on empirical training sets.",
        "Simulation-based studies prioritize mathematical precision at the expense of real-time execution speed.",
      ],
      findingsAgreement: [
        "All studies conclude that incorporating physical network topology significantly reduces estimation error.",
        "Conventional baseline algorithms struggle when subjected to high-frequency inverter noise.",
      ],
      findingsDisagreement: [
        "Divergent conclusions regarding the computational overhead vs accuracy trade-off during extreme contingencies.",
      ],
      researchGaps: [
        "Lack of standardized benchmark datasets featuring real-world phasor measurement unit (PMU) data.",
        "Hardware-in-the-loop (HIL) validation across multi-vendor inverter setups remains rare.",
      ],
      promisingDirections: [
        "Hybrid physics-guided graph neural networks combining topology awareness with real-time inference.",
        "Distributed multi-agent coordination architectures for decentralized microgrids.",
      ],
    };
  }
}
