import { CurriculumFramework } from "./constants/rubrics";

export type ModeType = "analogy" | "scenario";

export interface ScenarioElement {
  id: number;
  elementLabel: string;
  correctMapping: string;
}

export interface PackageResponse {
  contextText: string;
  elements: ScenarioElement[];
  framework?: CurriculumFramework;
  classLevel?: string;
  selectedStrands?: string[];
}

export interface IdentificationDetail {
  id: number;
  correct: boolean;
  feedback: string;
}

export interface CriterionA {
  level: number;
  justification: string;
}

export interface Criteria {
  A: CriterionA;
}

export interface StrandEvaluation {
  strandCode: string; // e.g. "A(i)"
  strandTitle: string;
  level: number; // 1-8
  rating: "Exceeding" | "Meeting" | "Developing" | "Beginning";
  feedback: string;
}

export interface AIReport {
  identification: {
    totalElements: number;
    correctCount: number;
    details: IdentificationDetail[];
  };
  overallFeedback: string;
  criteria: Criteria;
  strandEvaluations?: StrandEvaluation[];
  reflectionText?: string;
}

export interface StudentSubmission {
  assignmentId?: string;
  studentName: string;
  topic: string;
  mode: ModeType;
  framework: CurriculumFramework;
  classLevel: string;
  selectedStrands?: string[];
  contextText: string;
  timestamp: string;
  elements: ScenarioElement[];
  studentIdentifications: Record<number, string>;
  report: AIReport;
  formativeNumber?: number;
  formativeLabel?: string;
}

export interface CommonClassAssignment {
  id: string; // unique assignment code e.g. "TASK-MYP3-BIO"
  title: string;
  teacherName: string;
  framework: CurriculumFramework;
  classLevel: string; // e.g. "MYP3"
  topic: string;
  mode: ModeType;
  selectedStrands: string[];
  contextText: string;
  elements: ScenarioElement[];
  createdAt: string;
}
