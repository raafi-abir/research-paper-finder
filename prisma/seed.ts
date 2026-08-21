import { PrismaClient, ResearchLevel, DeliveryFrequency, ReportStatus, DifficultyLevel, NoveltyLevel } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_INTERESTS = [
  // Power & Energy
  { name: "Power Systems", category: "Power & Energy", description: "Generation, transmission, distribution, and grid dynamics." },
  { name: "Renewable Energy", category: "Power & Energy", description: "Solar, wind, hydro, and sustainable power integration." },
  { name: "Smart Grid", category: "Power & Energy", description: "Intelligent grid monitoring, metering, and decentralized control." },
  { name: "Energy Storage", category: "Power & Energy", description: "Batteries, supercapacitors, and energy management systems." },
  { name: "Microgrids", category: "Power & Energy", description: "Autonomous power networks and islanded operation." },
  { name: "Power Quality", category: "Power & Energy", description: "Harmonics, voltage stability, and grid compliance." },
  { name: "HVDC", category: "Power & Energy", description: "High-voltage direct current transmission systems." },

  // Electronics
  { name: "Analog Electronics", category: "Electronics", description: "Amplifiers, filter design, and analog signal processing." },
  { name: "Digital Electronics", category: "Electronics", description: "Logic circuits, microcontrollers, and FPGA architectures." },
  { name: "Power Electronics", category: "Electronics", description: "Inverters, converters, and high-efficiency power switching." },
  { name: "Semiconductor Devices", category: "Electronics", description: "MOSFET, IGBT, SiC, and GaN device physics." },
  { name: "VLSI", category: "Electronics", description: "Very Large Scale Integration chip design and layout." },
  { name: "Embedded Systems", category: "Electronics", description: "Real-time operating systems and microcontroller hardware." },
  { name: "Sensors", category: "Electronics", description: "Transducers, smart sensing, and signal conditioning." },

  // Communications
  { name: "Wireless Communication", category: "Communications", description: "Radio frequency links, cellular systems, and protocols." },
  { name: "RF Engineering", category: "Communications", description: "High-frequency circuit design and impedance matching." },
  { name: "Antennas", category: "Communications", description: "Electromagnetic wave propagation and phased arrays." },
  { name: "Signal Processing", category: "Communications", description: "Fourier analysis, filtering, and digital communication." },
  { name: "5G / 6G", category: "Communications", description: "Next-generation high-bandwidth cellular networks." },

  // Control & Automation
  { name: "Control Systems", category: "Control & Automation", description: "Feedback loops, PID, and optimal control theory." },
  { name: "Robotics", category: "Control & Automation", description: "Kinematics, autonomous navigation, and mechatronics." },
  { name: "Industrial Automation", category: "Control & Automation", description: "PLC systems, SCADA, and manufacturing control." },
  { name: "Intelligent Control", category: "Control & Automation", description: "Neural network and fuzzy logic-based control strategies." }
];

async function main() {
  console.log("Seeding PaperScout database...");

  // 1. Seed Interests
  const createdInterests: Record<string, string> = {};
  for (const item of SEED_INTERESTS) {
    const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const interest = await prisma.interest.upsert({
      where: { slug },
      update: { name: item.name, category: item.category, description: item.description },
      create: { name: item.name, slug, category: item.category, description: item.description }
    });
    createdInterests[slug] = interest.id;
  }
  console.log(`Seeded ${Object.keys(createdInterests).length} interests.`);

  // 2. Seed Demo User
  const user = await prisma.user.upsert({
    where: { email: "alex.chen@university.edu" },
    update: { name: "Alex Chen" },
    create: {
      name: "Alex Chen",
      email: "alex.chen@university.edu",
      passwordHash: "$2a$10$demoHashForPaperScoutTestingPhase2Password123"
    }
  });

  // 3. Seed Research Profile
  const profile = await prisma.researchProfile.upsert({
    where: { userId: user.id },
    update: {
      academicField: "Electrical & Electronic Engineering",
      researchLevel: ResearchLevel.GRADUATE,
      researchContext: "I'm interested in machine learning applications in power systems, especially fault detection, renewable energy integration, and smart grids.",
      deliveryFrequency: DeliveryFrequency.EVERY_3_DAYS,
      papersPerDigest: 5,
      researchGoals: ["Stay updated with research", "Find research gaps", "Find project ideas"]
    },
    create: {
      userId: user.id,
      academicField: "Electrical & Electronic Engineering",
      researchLevel: ResearchLevel.GRADUATE,
      researchContext: "I'm interested in machine learning applications in power systems, especially fault detection, renewable energy integration, and smart grids.",
      deliveryFrequency: DeliveryFrequency.EVERY_3_DAYS,
      papersPerDigest: 5,
      researchGoals: ["Stay updated with research", "Find research gaps", "Find project ideas"]
    }
  });

  // Link profile interests
  const targetInterestSlugs = ["power-systems", "renewable-energy", "power-electronics", "smart-grid"];
  for (const slug of targetInterestSlugs) {
    const interestId = createdInterests[slug];
    if (interestId) {
      await prisma.researchProfileInterest.upsert({
        where: {
          researchProfileId_interestId: {
            researchProfileId: profile.id,
            interestId
          }
        },
        update: {},
        create: {
          researchProfileId: profile.id,
          interestId
        }
      });
    }
  }

  // 4. Seed Realistic Papers
  const paper1 = await prisma.paper.upsert({
    where: { doi: "10.1109/TPWRS.2026.3190123" },
    update: {},
    create: {
      title: "Physics-Informed Neural Networks for Power System State Estimation",
      abstract: "State estimation in modern power grids faces significant scalability challenges due to high-frequency renewable fluctuations. We propose a physics-informed neural network (PINN) architecture embedding Kirchhoff laws directly into loss functions.",
      authors: ["A. Rahman", "J. Chen", "M. Patel"],
      journal: "IEEE Transactions on Power Systems",
      publicationDate: new Date("2026-08-08"),
      doi: "10.1109/TPWRS.2026.3190123",
      url: "https://doi.org/10.1109/TPWRS.2026.3190123",
      source: "IEEE",
      citationCount: 14,
      summary: "Combines physical power flow equations with deep neural networks for state estimation.",
      methodology: "PINNs with custom loss formulation tested on IEEE 118-bus system.",
      keyFindings: "Achieves 4.2x faster convergence and 18% higher estimation accuracy under noisy telemetry.",
      limitations: "Primarily validated on simulated synthetic telemetry."
    }
  });

  const paper2 = await prisma.paper.upsert({
    where: { doi: "10.1109/TEC.2026.3184510" },
    update: {},
    create: {
      title: "Grid-Forming Inverters Under High Renewable Penetration",
      abstract: "The replacement of synchronous generators with inverter-based renewables reduces grid inertia. This paper analyzes virtual synchronous machine control for grid-forming inverters.",
      authors: ["S. Kim", "R. Williams", "T. Nakamura"],
      journal: "IEEE Transactions on Energy Conversion",
      publicationDate: new Date("2026-08-06"),
      doi: "10.1109/TEC.2026.3184510",
      url: "https://doi.org/10.1109/TEC.2026.3184510",
      source: "IEEE",
      citationCount: 8,
      summary: "Evaluates stability metrics of grid-forming inverter topologies under 80%+ renewable penetration.",
      methodology: "Small-signal stability modeling and real-time digital simulator (RTDS) testing.",
      keyFindings: "Grid-forming control prevents voltage collapse during low-inertia trip events.",
      limitations: "Does not evaluate hybrid battery-solar coupling."
    }
  });

  const paper3 = await prisma.paper.upsert({
    where: { doi: "10.1109/JESTPE.2026.3179811" },
    update: {},
    create: {
      title: "Wide-Bandgap Semiconductor Devices for Next-Generation Power Electronics",
      abstract: "Silicon Carbide (SiC) and Gallium Nitride (GaN) power switches offer unprecedented efficiency for high-frequency converters. We present comparative thermal and switching performance.",
      authors: ["L. Zhang", "P. Singh", "H. Müller"],
      journal: "IEEE Journal of Emerging and Selected Topics in Power Electronics",
      publicationDate: new Date("2026-08-04"),
      doi: "10.1109/JESTPE.2026.3179811",
      url: "https://doi.org/10.1109/JESTPE.2026.3179811",
      source: "IEEE",
      citationCount: 22,
      summary: "Comparative benchmark of 1200V SiC MOSFETs and 650V GaN HEMTs.",
      methodology: "Double-pulse switching measurements up to 500 kHz.",
      keyFindings: "GaN demonstrates 35% lower switching loss at high frequencies.",
      limitations: "Long-term thermal aging under high dv/dt stress requires further empirical testing."
    }
  });

  // Link Papers to Interests
  if (createdInterests["power-systems"]) {
    await prisma.paperInterest.upsert({
      where: { paperId_interestId: { paperId: paper1.id, interestId: createdInterests["power-systems"] } },
      update: { relevanceScore: 0.94 },
      create: { paperId: paper1.id, interestId: createdInterests["power-systems"], relevanceScore: 0.94 }
    });
  }

  if (createdInterests["renewable-energy"]) {
    await prisma.paperInterest.upsert({
      where: { paperId_interestId: { paperId: paper2.id, interestId: createdInterests["renewable-energy"] } },
      update: { relevanceScore: 0.91 },
      create: { paperId: paper2.id, interestId: createdInterests["renewable-energy"], relevanceScore: 0.91 }
    });
  }

  if (createdInterests["power-electronics"]) {
    await prisma.paperInterest.upsert({
      where: { paperId_interestId: { paperId: paper3.id, interestId: createdInterests["power-electronics"] } },
      update: { relevanceScore: 0.88 },
      create: { paperId: paper3.id, interestId: createdInterests["power-electronics"], relevanceScore: 0.88 }
    });
  }

  // 5. Seed Research Gaps
  await prisma.researchGap.create({
    data: {
      paperId: paper1.id,
      title: "Real-world validation of AI-based grid protection",
      description: "Many recent studies demonstrate strong results using simulated datasets, but comparatively fewer evaluate their methods with real-time or utility-scale measurements.",
      potentialDirection: "Deploy PINN estimator on distribution feeder PMU stream."
    }
  });

  await prisma.researchGap.create({
    data: {
      paperId: paper3.id,
      title: "Thermal reliability of wide-bandgap devices",
      description: "Higher switching frequencies improve converter performance but introduce thermal and reliability challenges that remain active areas of research.",
      potentialDirection: "Develop adaptive gate driver with real-time junction temperature feedback."
    }
  });

  // 6. Seed Research Ideas
  await prisma.researchIdea.create({
    data: {
      paperId: paper1.id,
      title: "Physics-Guided Transfer Learning for Microgrid Fault Detection",
      description: "Apply pre-trained transmission grid PINNs to microgrids with sparse PMU coverage.",
      difficulty: DifficultyLevel.MODERATE,
      novelty: NoveltyLevel.HIGH
    }
  });

  // 7. Seed Initial Report Digest
  const report = await prisma.report.create({
    data: {
      userId: user.id,
      title: "PaperScout Research Digest — August 12, 2026",
      summary: "Curated research pulse covering Physics-Informed Neural Networks, Grid-Forming Inverters, and Wide-Bandgap Devices.",
      status: ReportStatus.COMPLETED,
      periodStart: new Date("2026-08-01"),
      periodEnd: new Date("2026-08-12")
    }
  });

  await prisma.reportPaper.createMany({
    data: [
      { reportId: report.id, paperId: paper1.id, position: 1 },
      { reportId: report.id, paperId: paper2.id, position: 2 },
      { reportId: report.id, paperId: paper3.id, position: 3 }
    ]
  });

  console.log("Seeding complete successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
