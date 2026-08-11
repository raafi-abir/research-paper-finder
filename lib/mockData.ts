export interface Paper {
  id: string;
  number: string;
  title: string;
  authors: string[];
  publication: string;
  date: string;
  relevanceScore: number;
  whyItMatters: string;
  inBrief: string;
  researchOpportunity: string;
  link?: string;
  saved?: boolean;
}

export interface EmergingTopic {
  id: string;
  title: string;
  trend: string;
  description?: string;
}

export interface ResearchGap {
  id: string;
  title: string;
  description: string;
  linkText: string;
}

export interface StudyField {
  id: string;
  name: string;
  categories: {
    name: string;
    topics: string[];
  }[];
}

export const INITIAL_USER_INTERESTS = [
  "Power Systems",
  "Renewable Energy",
  "Power Electronics",
  "Smart Grid",
  "Semiconductor Devices",
  "Energy Storage"
];

export const MOCK_PAPERS: Paper[] = [
  {
    id: "paper-1",
    number: "01",
    title: "Physics-Informed Neural Networks for Power System State Estimation",
    authors: ["A. Rahman", "J. Chen", "M. Patel"],
    publication: "IEEE Transactions on Power Systems",
    date: "August 8, 2026",
    relevanceScore: 94,
    whyItMatters: "This work connects directly to your interest in intelligent power systems and explores a promising approach to state estimation under increasingly complex grid conditions.",
    inBrief: "The authors introduce a physics-informed learning framework for state estimation and report improved robustness compared with conventional data-driven approaches.",
    researchOpportunity: "Most validation remains simulation-based, leaving room for evaluation with real-world grid data.",
  },
  {
    id: "paper-2",
    number: "02",
    title: "Grid-Forming Inverters Under High Renewable Penetration",
    authors: ["S. Kim", "R. Williams", "T. Nakamura"],
    publication: "IEEE Transactions on Energy Conversion",
    date: "August 6, 2026",
    relevanceScore: 91,
    whyItMatters: "The paper addresses stability challenges that become increasingly important as conventional synchronous generation is replaced by inverter-based resources.",
    inBrief: "The study evaluates grid-forming control strategies under varying renewable penetration levels.",
    researchOpportunity: "Testing under mixed renewable and storage scenarios remains relatively limited.",
  },
  {
    id: "paper-3",
    number: "03",
    title: "Wide-Bandgap Semiconductor Devices for Next-Generation Power Electronics",
    authors: ["L. Zhang", "P. Singh", "H. Müller"],
    publication: "IEEE Journal of Emerging and Selected Topics in Power Electronics",
    date: "August 4, 2026",
    relevanceScore: 88,
    whyItMatters: "This paper sits at the intersection of your interests in semiconductor devices and power electronics.",
    inBrief: "The authors compare SiC and GaN device characteristics for high-frequency power conversion.",
    researchOpportunity: "Thermal management and long-term reliability under high-frequency operation remain open challenges.",
  }
];

export const MOCK_EMERGING_TOPICS: EmergingTopic[] = [
  { id: "topic-1", title: "Physics-informed machine learning", trend: "+34% this month" },
  { id: "topic-2", title: "Grid-forming inverters", trend: "+28% this month" },
  { id: "topic-3", title: "Wide-bandgap semiconductors", trend: "+21% this month" },
  { id: "topic-4", title: "Battery energy storage", trend: "+19% this month" },
  { id: "topic-5", title: "AI-based fault detection", trend: "+15% this month" },
  { id: "topic-6", title: "Digital twins for power systems", trend: "+12% this month" },
];

export const MOCK_RESEARCH_GAPS: ResearchGap[] = [
  {
    id: "gap-1",
    title: "Real-world validation of AI-based grid protection",
    description: "Many recent studies demonstrate strong results using simulated datasets, but comparatively fewer evaluate their methods with real-time or utility-scale measurements.",
    linkText: "Explore this gap →"
  },
  {
    id: "gap-2",
    title: "Thermal reliability of wide-bandgap devices",
    description: "Higher switching frequencies improve converter performance but introduce thermal and reliability challenges that remain active areas of research.",
    linkText: "Explore this gap →"
  }
];

export const ACADEMIC_FIELDS: StudyField[] = [
  {
    id: "eee",
    name: "Electrical & Electronic Engineering",
    categories: [
      {
        name: "POWER & ENERGY",
        topics: [
          "Power Systems",
          "Renewable Energy",
          "Smart Grid",
          "Energy Storage",
          "Microgrids",
          "Power Quality",
          "HVDC"
        ]
      },
      {
        name: "ELECTRONICS",
        topics: [
          "Analog Electronics",
          "Digital Electronics",
          "Power Electronics",
          "Semiconductor Devices",
          "VLSI",
          "Embedded Systems",
          "Sensors"
        ]
      },
      {
        name: "COMMUNICATIONS",
        topics: [
          "Wireless Communication",
          "RF Engineering",
          "Antennas",
          "Signal Processing",
          "5G / 6G"
        ]
      },
      {
        name: "CONTROL",
        topics: [
          "Control Systems",
          "Robotics",
          "Industrial Automation",
          "Intelligent Control"
        ]
      }
    ]
  },
  {
    id: "cs",
    name: "Computer Science",
    categories: [
      {
        name: "ARTIFICIAL INTELLIGENCE",
        topics: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP", "Robotics"]
      },
      {
        name: "SYSTEMS",
        topics: ["Distributed Systems", "Operating Systems", "Cloud Computing", "Computer Architecture"]
      }
    ]
  },
  {
    id: "me",
    name: "Mechanical Engineering",
    categories: [
      {
        name: "THERMAL & FLUIDS",
        topics: ["Thermodynamics", "Fluid Dynamics", "Heat Transfer", "HVAC"]
      }
    ]
  },
  {
    id: "ce",
    name: "Civil Engineering",
    categories: [
      {
        name: "STRUCTURES",
        topics: ["Structural Analysis", "Geotechnical Engineering", "Transportation"]
      }
    ]
  },
  {
    id: "bme",
    name: "Biomedical Engineering",
    categories: [
      {
        name: "BIOMEDICAL",
        topics: ["Bioinstrumentation", "Tissue Engineering", "Medical Imaging"]
      }
    ]
  },
  {
    id: "physics",
    name: "Physics",
    categories: [
      {
        name: "PHYSICS",
        topics: ["Condensed Matter", "Quantum Mechanics", "Optics", "Astrophysics"]
      }
    ]
  },
  {
    id: "math",
    name: "Mathematics",
    categories: [
      {
        name: "MATHEMATICS",
        topics: ["Applied Mathematics", "Optimization", "Statistics", "Dynamical Systems"]
      }
    ]
  }
];
