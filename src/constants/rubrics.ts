export type CurriculumFramework = "MYP" | "IGCSE" | "IBDP";

export interface ClassLevelOption {
  code: string;
  label: string;
  framework: CurriculumFramework;
  gradeDescription: string;
}

export const CURRICULUM_FRAMEWORKS: { code: CurriculumFramework; name: string; description: string }[] = [
  {
    code: "MYP",
    name: "IB MYP (Middle Years Programme)",
    description: "IB Middle Years Programme Science (MYP 1 to 5, Grades 6-10)"
  },
  {
    code: "IGCSE",
    name: "Cambridge IGCSE",
    description: "Cambridge IGCSE / Lower Secondary Science (FM 1 to 5, Grades 6-10)"
  },
  {
    code: "IBDP",
    name: "IB Diploma Programme (DP)",
    description: "IB DP Higher / Standard Level Science (IBDP 1 & 2, Grades 11-12)"
  }
];

export const CLASS_LEVELS: ClassLevelOption[] = [
  // Cambridge IGCSE / FM
  { code: "FM1", label: "FM 1", framework: "IGCSE", gradeDescription: "Grade 6 / Age 11-12 (Foundational)" },
  { code: "FM2", label: "FM 2", framework: "IGCSE", gradeDescription: "Grade 7 / Age 12-13 (Intermediate)" },
  { code: "FM3", label: "FM 3", framework: "IGCSE", gradeDescription: "Grade 8 / Age 13-14 (Core IGCSE Intro)" },
  { code: "FM4", label: "FM 4", framework: "IGCSE", gradeDescription: "Grade 9 / Age 14-15 (Extended IGCSE)" },
  { code: "FM5", label: "FM 5", framework: "IGCSE", gradeDescription: "Grade 10 / Age 15-16 (IGCSE Examination Level)" },

  // IB MYP
  { code: "MYP1", label: "MYP 1", framework: "MYP", gradeDescription: "Grade 6 / Year 1 MYP Sciences" },
  { code: "MYP2", label: "MYP 2", framework: "MYP", gradeDescription: "Grade 7 / Year 2 MYP Sciences" },
  { code: "MYP3", label: "MYP 3", framework: "MYP", gradeDescription: "Grade 8 / Year 3 MYP Sciences" },
  { code: "MYP4", label: "MYP 4", framework: "MYP", gradeDescription: "Grade 9 / Year 4 MYP Sciences" },
  { code: "MYP5", label: "MYP 5", framework: "MYP", gradeDescription: "Grade 10 / Year 5 MYP Sciences eAssessment Level" },

  // IB DP
  { code: "IBDP1", label: "IBDP 1", framework: "IBDP", gradeDescription: "Grade 11 / Year 1 IB Diploma Sciences (SL/HL)" },
  { code: "IBDP2", label: "IBDP 2", framework: "IBDP", gradeDescription: "Grade 12 / Year 2 IB Diploma Sciences (SL/HL Final)" }
];

export interface StrandDefinition {
  code: string; // e.g. "A(i)"
  criterion: "A" | "B" | "C" | "D";
  title: string;
  description: string;
}

export interface CriterionDefinition {
  code: "A" | "B" | "C" | "D";
  title: string;
  description: string;
  strands: StrandDefinition[];
}

export const MYP_CRITERIA_DEFINITIONS: Record<"A" | "B" | "C" | "D", CriterionDefinition> = {
  A: {
    code: "A",
    title: "Criterion A: Knowing and understanding",
    description: "Students develop scientific knowledge (facts, concepts, ideas) and apply it to solve problems.",
    strands: [
      {
        code: "A(i)",
        criterion: "A",
        title: "Explain scientific knowledge",
        description: "Explain scientific knowledge accurately and with appropriate scientific vocabulary."
      },
      {
        code: "A(ii)",
        criterion: "A",
        title: "Apply scientific knowledge & understanding",
        description: "Apply scientific knowledge and understanding to solve problems set in familiar and unfamiliar situations."
      },
      {
        code: "A(iii)",
        criterion: "A",
        title: "Analyse & evaluate information",
        description: "Analyse and evaluate information to make scientifically supported judgments."
      }
    ]
  },
  B: {
    code: "B",
    title: "Criterion B: Inquiring and designing",
    description: "Students design scientific investigations, formulate hypotheses, and identify variables.",
    strands: [
      {
        code: "B(i)",
        criterion: "B",
        title: "Explain problem or question to be tested",
        description: "Explain a problem or question to be tested by a scientific investigation."
      },
      {
        code: "B(ii)",
        criterion: "B",
        title: "Formulate testable hypothesis",
        description: "Formulate a testable hypothesis and explain it using scientific reasoning."
      },
      {
        code: "B(iii)",
        criterion: "B",
        title: "Manipulate variables & data collection",
        description: "Explain how to manipulate variables, and explain how data will be collected."
      },
      {
        code: "B(iv)",
        criterion: "B",
        title: "Design scientific investigations",
        description: "Design clear, logical, and safe scientific investigations."
      }
    ]
  },
  C: {
    code: "C",
    title: "Criterion C: Processing and evaluating",
    description: "Students transform data, interpret results, and evaluate method validity and hypotheses.",
    strands: [
      {
        code: "C(i)",
        criterion: "C",
        title: "Present collected & transformed data",
        description: "Present collected and transformed data in appropriate formats (tables, graphs)."
      },
      {
        code: "C(ii)",
        criterion: "C",
        title: "Interpret data & explain results",
        description: "Interpret data and explain results using correct scientific reasoning."
      },
      {
        code: "C(iii)",
        criterion: "C",
        title: "Evaluate hypothesis validity",
        description: "Evaluate the validity of a hypothesis based on the outcome of the scientific investigation."
      },
      {
        code: "C(iv)",
        criterion: "C",
        title: "Evaluate method validity",
        description: "Evaluate the validity of the experimental method used."
      },
      {
        code: "C(v)",
        criterion: "C",
        title: "Explain improvements or extensions",
        description: "Explain improvements or extensions to the scientific method."
      }
    ]
  },
  D: {
    code: "D",
    title: "Criterion D: Reflecting on the impacts of science",
    description: "Students evaluate the real-world applications and global implications of scientific solutions.",
    strands: [
      {
        code: "D(i)",
        criterion: "D",
        title: "Explain applications of science",
        description: "Explain the ways in which science is applied and used to address a specific problem or issue."
      },
      {
        code: "D(ii)",
        criterion: "D",
        title: "Discuss & evaluate implications",
        description: "Discuss and evaluate implications (moral, ethical, social, environmental, economic) of scientific applications."
      },
      {
        code: "D(iii)",
        criterion: "D",
        title: "Apply scientific language effectively",
        description: "Apply scientific language effectively in communicating ideas and reflections."
      },
      {
        code: "D(iv)",
        criterion: "D",
        title: "Document work & sources",
        description: "Document the work of others and sources of information used accurately."
      }
    ]
  }
};

export const ALL_STRANDS: StrandDefinition[] = [
  ...MYP_CRITERIA_DEFINITIONS.A.strands,
  ...MYP_CRITERIA_DEFINITIONS.B.strands,
  ...MYP_CRITERIA_DEFINITIONS.C.strands,
  ...MYP_CRITERIA_DEFINITIONS.D.strands
];

// Default recommended strands for Analogy & Scenario modes
export const DEFAULT_ANALOGY_STRANDS = ["A(i)", "A(ii)", "D(iii)"];
export const DEFAULT_SCENARIO_STRANDS = ["A(i)", "A(ii)", "A(iii)", "D(iii)"];
