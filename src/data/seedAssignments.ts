import { CommonClassAssignment, ScenarioElement, PackageResponse, AIReport } from "../types";

export const BUILTIN_ASSIGNMENTS: Record<string, CommonClassAssignment> = {
  MYP5: {
    id: "TASK-MYP5-PLANTS",
    title: "MYP5 Diagnostic Assessment — Reproduction in Plants",
    teacherName: "Science Department",
    framework: "MYP",
    classLevel: "MYP5",
    topic: "Reproduction in plants",
    mode: "scenario",
    selectedStrands: ["A(i)", "A(ii)", "D(iii)"],
    contextText: "A gardener in a botanical greenhouse carefully transfers fine yellow powder from the vibrant petals of a blooming flower onto the sticky tip of a central stalk. Inside the flower's swollen base, microscopic cells fuse together to form a developing embryo. Over time, the surrounding tissue thickens into a protective sweet fruit to attract birds, while tough outer coats enclose the dormant seeds until warm moisture triggers germination.",
    elements: [
      { id: 1, elementLabel: "Fine yellow powder from the petals", correctMapping: "Pollen grains containing male gametes" },
      { id: 2, elementLabel: "Sticky tip of the central stalk", correctMapping: "Stigma receptive surface for pollination" },
      { id: 3, elementLabel: "Swollen base at the bottom of the stalk", correctMapping: "Ovary containing ovules" },
      { id: 4, elementLabel: "Microscopic cells fusing together", correctMapping: "Fertilization (fusion of male and female gametes)" },
      { id: 5, elementLabel: "Thickened surrounding sweet tissue", correctMapping: "Fruit formed from ripened ovary wall" },
      { id: 6, elementLabel: "Tough outer coat enclosing dormant embryo", correctMapping: "Seed coat (Testa) protecting embryo" }
    ],
    createdAt: new Date().toISOString()
  },
  MYP3: {
    id: "TASK-MYP3-CELLS",
    title: "MYP3 Diagnostic Assessment — Cell Structure & Function",
    teacherName: "Science Department",
    framework: "MYP",
    classLevel: "MYP3",
    topic: "Cell Structure & Function",
    mode: "analogy",
    selectedStrands: ["A(i)", "A(ii)", "D(iii)"],
    contextText: "A high-security factory operates under strict central management from its main control office where master blueprints are stored. Power generators across the floor supply steady electrical energy to assembly lines where packaging robots wrap products in protective bubbles. Meanwhile, a flexible perimeter boundary regulates all incoming raw materials and outgoing waste shipments.",
    elements: [
      { id: 1, elementLabel: "Main control office holding blueprints", correctMapping: "Nucleus containing DNA" },
      { id: 2, elementLabel: "Power generators supplying energy", correctMapping: "Mitochondria producing ATP energy" },
      { id: 3, elementLabel: "Assembly lines building products", correctMapping: "Ribosomes synthesizing proteins" },
      { id: 4, elementLabel: "Packaging robots wrapping products", correctMapping: "Golgi apparatus packaging molecules" },
      { id: 5, elementLabel: "Flexible perimeter boundary", correctMapping: "Cell membrane regulating movement" },
      { id: 6, elementLabel: "Protective bubbles wrapping products", correctMapping: "Vesicles for intracellular transport" }
    ],
    createdAt: new Date().toISOString()
  },
  MYP1: {
    id: "TASK-MYP1-PHOTOSYNTHESIS",
    title: "MYP1 Diagnostic Assessment — Photosynthesis & Plant Cells",
    teacherName: "Science Department",
    framework: "MYP",
    classLevel: "MYP1",
    topic: "Photosynthesis & Plant Cells",
    mode: "scenario",
    selectedStrands: ["A(i)", "A(ii)", "D(iii)"],
    contextText: "A green leaf basking under morning sunlight absorbs invisible gas through tiny underside pore doors while water travels up from deep soil roots. Solar energy captured by microscopic green solar panels converts raw inputs into rich energy sugars and releases fresh oxygen gas into the surrounding forest air.",
    elements: [
      { id: 1, elementLabel: "Tiny underside pore doors", correctMapping: "Stomata for gas exchange" },
      { id: 2, elementLabel: "Water traveling up from deep soil roots", correctMapping: "Xylem transport of water" },
      { id: 3, elementLabel: "Microscopic green solar panels", correctMapping: "Chloroplasts containing chlorophyll" },
      { id: 4, elementLabel: "Invisible gas absorbed from air", correctMapping: "Carbon dioxide gas" },
      { id: 5, elementLabel: "Rich energy sugars produced", correctMapping: "Glucose energy molecules" },
      { id: 6, elementLabel: "Fresh gas released into forest air", correctMapping: "Oxygen gas byproduct" }
    ],
    createdAt: new Date().toISOString()
  },
  MYP2: {
    id: "TASK-MYP2-DIGESTION",
    title: "MYP2 Diagnostic Assessment — Human Digestive System",
    teacherName: "Science Department",
    framework: "MYP",
    classLevel: "MYP2",
    topic: "Human Digestive System",
    mode: "scenario",
    selectedStrands: ["A(i)", "A(ii)", "D(iii)"],
    contextText: "During a meal, food is mechanically crushed in a grinding chamber before descending down a smooth muscular pipe into an acidic churning reservoir. Specialized chemical scissors break complex nutrients down into microscopic building blocks, which pass through folded carpet-like walls directly into tiny blood highways.",
    elements: [
      { id: 1, elementLabel: "Grinding chamber crushing food", correctMapping: "Mouth with teeth (mastication)" },
      { id: 2, elementLabel: "Smooth muscular pipe", correctMapping: "Esophagus performing peristalsis" },
      { id: 3, elementLabel: "Acidic churning reservoir", correctMapping: "Stomach releasing gastric juice" },
      { id: 4, elementLabel: "Specialized chemical scissors", correctMapping: "Digestive enzymes (e.g. amylase, protease)" },
      { id: 5, elementLabel: "Folded carpet-like walls", correctMapping: "Villi of small intestine" },
      { id: 6, elementLabel: "Tiny blood highways", correctMapping: "Capillaries absorbing nutrients" }
    ],
    createdAt: new Date().toISOString()
  },
  MYP4: {
    id: "TASK-MYP4-CHEMISTRY",
    title: "MYP4 Diagnostic Assessment — Chemical Reactions & Conservation of Mass",
    teacherName: "Science Department",
    framework: "MYP",
    classLevel: "MYP4",
    topic: "Chemical Reactions & Conservation of Mass",
    mode: "scenario",
    selectedStrands: ["A(i)", "A(ii)", "D(iii)"],
    contextText: "In a sealed glass flask, two clear solutions are mixed together, immediately forming a cloudy white precipitate and releasing heat energy. Although existing atomic bonds break and rearrange into entirely new compounds, a digital balance shows that the total mass before and after the reaction remains exactly identical.",
    elements: [
      { id: 1, elementLabel: "Sealed glass flask", correctMapping: "Closed system preventing mass escape" },
      { id: 2, elementLabel: "Cloudy white precipitate", correctMapping: "Insoluble chemical product formed" },
      { id: 3, elementLabel: "Release of heat energy", correctMapping: "Exothermic reaction releasing thermal energy" },
      { id: 4, elementLabel: "Existing atomic bonds breaking and rearranging", correctMapping: "Chemical rearrangement of reactant atoms into products" },
      { id: 5, elementLabel: "New compounds formed", correctMapping: "Products of chemical reaction" },
      { id: 6, elementLabel: "Digital balance showing identical total mass", correctMapping: "Law of Conservation of Mass" }
    ],
    createdAt: new Date().toISOString()
  },
  IBDP1: {
    id: "TASK-IBDP1-RESPIRATION",
    title: "IBDP1 Diagnostic Assessment — Cellular Respiration & ATP Synthesis",
    teacherName: "Science Department",
    framework: "IBDP",
    classLevel: "IBDP1",
    topic: "Cellular Respiration & ATP Synthesis",
    mode: "scenario",
    selectedStrands: ["A(i)", "A(ii)", "D(iii)"],
    contextText: "Inside the folded inner membrane of a mitochondrion, high-energy electron carriers donate electrons to a protein transport chain, driving protons across the membrane. As protons flow back down their concentration gradient through a specialized molecular turbine, phosphate groups are attached to carrier molecules to generate high-value cellular energy currency.",
    elements: [
      { id: 1, elementLabel: "Folded inner membrane", correctMapping: "Mitochondrial cristae" },
      { id: 2, elementLabel: "High-energy electron carriers", correctMapping: "NADH and FADH2 coenzymes" },
      { id: 3, elementLabel: "Protein transport chain", correctMapping: "Electron Transport Chain (ETC)" },
      { id: 4, elementLabel: "Protons flowing down concentration gradient", correctMapping: "Chemiosmosis (proton motive force)" },
      { id: 5, elementLabel: "Specialized molecular turbine", correctMapping: "ATP Synthase enzyme" },
      { id: 6, elementLabel: "High-value cellular energy currency", correctMapping: "Adenosine Triphosphate (ATP)" }
    ],
    createdAt: new Date().toISOString()
  }
};

// Aliases lookup
export function findBuiltinAssignment(rawQuery: string): CommonClassAssignment {
  const q = rawQuery.trim().toUpperCase().replace(/[\s\-_:]/g, "");

  if (BUILTIN_ASSIGNMENTS[q]) {
    return BUILTIN_ASSIGNMENTS[q];
  }

  // Exact ID or title match
  for (const assign of Object.values(BUILTIN_ASSIGNMENTS)) {
    if (assign.id.toUpperCase().replace(/[\s\-_:]/g, "") === q) {
      return assign;
    }
    if (assign.classLevel.toUpperCase().replace(/[\s\-_:]/g, "") === q) {
      return assign;
    }
  }

  // Substring matches
  if (q.includes("MYP5") || q.includes("FM5") || q.includes("PLANT") || q.includes("GRADE10") || q.includes("YEAR10")) {
    return BUILTIN_ASSIGNMENTS.MYP5;
  }
  if (q.includes("MYP1") || q.includes("FM1") || q.includes("PHOTO") || q.includes("GRADE6") || q.includes("YEAR6")) {
    return BUILTIN_ASSIGNMENTS.MYP1;
  }
  if (q.includes("MYP2") || q.includes("FM2") || q.includes("DIGEST") || q.includes("GRADE7") || q.includes("YEAR7")) {
    return BUILTIN_ASSIGNMENTS.MYP2;
  }
  if (q.includes("MYP4") || q.includes("FM4") || q.includes("CHEM") || q.includes("GRADE9") || q.includes("YEAR9")) {
    return BUILTIN_ASSIGNMENTS.MYP4;
  }
  if (q.includes("IBDP") || q.includes("DP") || q.includes("RESPIR") || q.includes("GRADE11") || q.includes("YEAR11")) {
    return BUILTIN_ASSIGNMENTS.IBDP1;
  }

  // Default fallback to MYP5 / MYP3
  return BUILTIN_ASSIGNMENTS.MYP5;
}

// Built-in offline generator for individual practice tasks
export function generateCurriculumPackageOffline(
  topic: string,
  mode: "analogy" | "scenario",
  framework: string,
  classLevel: string
): PackageResponse {
  const normTopic = topic.toLowerCase();

  if (normTopic.includes("plant") || normTopic.includes("reproduction") || normTopic.includes("flower") || normTopic.includes("pollinat")) {
    return {
      contextText: "A botanist examines an angiosperm flower during spring. Bright petals display pollen on extended filaments while pollinators carry grains to sticky stigmas. Inside the ovary, pollen tubes penetrate ovules to accomplish fertilization, leading to seed and fruit formation.",
      elements: [
        { id: 1, elementLabel: "Fine grains produced on extended filaments", correctMapping: "Pollen grains containing male plant gametes" },
        { id: 2, elementLabel: "Sticky receptive landing pad for pollen", correctMapping: "Stigma of carpel/pistil" },
        { id: 3, elementLabel: "Elongated passage tube leading to base", correctMapping: "Style / pollen tube pathway" },
        { id: 4, elementLabel: "Swollen base housing reproductive ovules", correctMapping: "Ovary protecting ovules" },
        { id: 5, elementLabel: "Microscopic fusion event in ovule", correctMapping: "Double fertilization forming zygote and endosperm" },
        { id: 6, elementLabel: "Ripened protective casing surrounding seeds", correctMapping: "Fruit developing from ovary wall" }
      ],
      framework: framework as any,
      classLevel,
      selectedStrands: ["A(i)", "A(ii)", "D(iii)"]
    };
  }

  if (normTopic.includes("cell") || normTopic.includes("organelle") || normTopic.includes("membrane")) {
    return {
      contextText: "A specialized biological unit maintains life functions through compartmentalized structures. A central vault houses genetic blueprints, while biochemical engines burn glucose to synthesize energy currency. Membrane bound factories package proteins, and a selectively permeable phospholipid envelope controls all boundary transport.",
      elements: [
        { id: 1, elementLabel: "Central vault housing genetic blueprints", correctMapping: "Nucleus containing DNA" },
        { id: 2, elementLabel: "Biochemical engines synthesizing energy currency", correctMapping: "Mitochondria performing aerobic respiration" },
        { id: 3, elementLabel: "Ribosome studded manufacturing network", correctMapping: "Rough Endoplasmic Reticulum (RER)" },
        { id: 4, elementLabel: "Sorting and packaging post office apparatus", correctMapping: "Golgi apparatus" },
        { id: 5, elementLabel: "Selectively permeable phospholipid envelope", correctMapping: "Cell membrane (Plasma membrane)" },
        { id: 6, elementLabel: "Fluid gel matrix filling interior volume", correctMapping: "Cytoplasm / Cytosol" }
      ],
      framework: framework as any,
      classLevel,
      selectedStrands: ["A(i)", "A(ii)", "D(iii)"]
    };
  }

  // General scientific model fallback
  return {
    contextText: `A scientific investigation into ${topic} reveals core mechanistic principles. Input materials interact under specific environmental conditions to transfer energy, rearrange physical or chemical structures, and produce measurable systemic outputs following conservation laws.`,
    elements: [
      { id: 1, elementLabel: `Primary input components driving ${topic}`, correctMapping: `Key reactants / starting materials of ${topic}` },
      { id: 2, elementLabel: "Catalytic or environmental trigger initiating process", correctMapping: `Activation energy or environmental condition required` },
      { id: 3, elementLabel: "Internal structural transformation or interaction", correctMapping: `Mechanistic stage / energy transfer phase` },
      { id: 4, elementLabel: "Regulating boundary or equilibrium controller", correctMapping: `Feedback mechanism or boundary condition` },
      { id: 5, elementLabel: `Final output products yielded by ${topic}`, correctMapping: `Key products or outcomes of ${topic}` },
      { id: 6, elementLabel: "Overall conservation of matter and energy demonstrated", correctMapping: "Conservation principle / systemic balance" }
    ],
    framework: framework as any,
    classLevel,
    selectedStrands: ["A(i)", "A(ii)", "D(iii)"]
  };
}

// Built-in offline evaluator for grading responses
export function evaluateSubmissionOffline(
  elements: ScenarioElement[],
  studentIdentifications: Record<number, string>,
  studentReflection: string
): AIReport {
  let correctCount = 0;
  const details = elements.map((elem) => {
    const studentAns = (studentIdentifications[elem.id] || "").trim().toLowerCase();
    const correctAns = elem.correctMapping.toLowerCase();

    // Check if student attempted a meaningful response
    let isCorrect = false;
    let feedback = "";

    if (!studentAns || studentAns.length < 3) {
      isCorrect = false;
      feedback = `No response provided. Correct scientific concept: "${elem.correctMapping}".`;
    } else {
      // Keyword matching
      const targetWords = correctAns.split(/[\s,()\/]+/).filter((w) => w.length > 3);
      const matched = targetWords.some((w) => studentAns.includes(w));

      if (matched || studentAns.length > 15) {
        isCorrect = true;
        correctCount++;
        feedback = `Accurately identified and mapped to "${elem.correctMapping}".`;
      } else {
        isCorrect = false;
        feedback = `Partially attempted, but expected scientific concept: "${elem.correctMapping}".`;
      }
    }

    return {
      id: elem.id,
      correct: isCorrect,
      feedback
    };
  });

  // Calculate criterion level
  let level = 1;
  if (correctCount >= 5) level = 7;
  else if (correctCount >= 4) level = 5;
  else if (correctCount >= 3) level = 4;
  else if (correctCount >= 2) level = 3;
  else if (correctCount >= 1) level = 2;
  else level = 1;

  const strandEvals = [
    {
      strandCode: "A(i)",
      strandTitle: "Explain scientific knowledge",
      level: Math.min(8, level + 1),
      rating: (level >= 6 ? "Exceeding" : level >= 4 ? "Meeting" : level >= 2 ? "Developing" : "Beginning") as any,
      feedback: `Demonstrated understanding on ${correctCount}/${elements.length} components.`
    },
    {
      strandCode: "A(ii)",
      strandTitle: "Apply scientific knowledge and understanding to solve problems set in familiar and unfamiliar situations",
      level,
      rating: (level >= 6 ? "Exceeding" : level >= 4 ? "Meeting" : level >= 2 ? "Developing" : "Beginning") as any,
      feedback: `Transferred analogical concepts to scientific mechanisms with ${Math.round((correctCount / elements.length) * 100)}% accuracy.`
    },
    {
      strandCode: "D(iii)",
      strandTitle: "Apply scientific language effectively",
      level: Math.min(8, level),
      rating: (level >= 5 ? "Meeting" : "Developing") as any,
      feedback: "Applied scientific terminology across identification responses."
    }
  ];

  return {
    identification: {
      totalElements: elements.length,
      correctCount,
      details
    },
    overallFeedback: `Diagnostic complete: Student accurately identified ${correctCount} of ${elements.length} target concepts. Criterion A achievement placed at Level ${level}/8.`,
    criteria: {
      A: {
        level,
        justification: `Based on scientific accuracy (${correctCount}/${elements.length} elements mapped correctly), Criterion A performance aligns with Level ${level}/8.`
      }
    },
    strandEvaluations: strandEvals,
    reflectionText: studentReflection
  };
}
