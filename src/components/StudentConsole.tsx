import React, { useState, useEffect } from "react";
import {
  ModeType,
  ScenarioElement,
  AIReport,
  StudentSubmission,
  StrandEvaluation
} from "../types";
import {
  CurriculumFramework,
  CURRICULUM_FRAMEWORKS,
  CLASS_LEVELS,
  MYP_CRITERIA_DEFINITIONS,
  ALL_STRANDS,
  DEFAULT_ANALOGY_STRANDS,
  DEFAULT_SCENARIO_STRANDS
} from "../constants/rubrics";
import {
  Sparkles,
  Lock,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  BookOpen,
  Send,
  Loader2,
  FileJson,
  BrainCircuit,
  Award,
  Layers,
  HelpCircle,
  Columns2,
  FileText,
  Key,
  AlertCircle,
  GraduationCap,
  Users,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
  Tag
} from "lucide-react";

const PRESET_TOPICS = [
  "Cell Structure & Function",
  "Photosynthesis",
  "Aerobic & Anaerobic Respiration",
  "Osmosis & Diffusion",
  "The Digestive System",
  "Enzymes",
  "The Circulatory System",
  "Ecosystems & Food Chains",
  "Genetics & DNA Replication",
  "Chemical Energetics & Reactions"
];

interface StudentConsoleProps {
  onPhaseChange: (phase: number) => void;
  onNavigateToApiPage?: () => void;
}

// Helper function to safely fetch JSON and provide clean error messages
async function safeFetchJson(url: string, options: RequestInit) {
  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (netErr: any) {
    throw new Error(
      `Network Connection Error: ${netErr.message || "Failed to reach server"}. Please verify your network connection.`
    );
  }

  const contentType = res.headers.get("content-type") || "";
  let data: any = null;
  let rawText = "";

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      rawText = await res.text().catch(() => "");
    }
  } else {
    rawText = await res.text().catch(() => "");
  }

  if (!res.ok) {
    if (data && data.error) {
      throw new Error(data.error);
    }
    if (rawText) {
      const cleanMsg = rawText.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      throw new Error(
        `Server returned error (${res.status}): ${cleanMsg.slice(0, 140) || res.statusText}`
      );
    }
    throw new Error(`Server error (${res.status}): ${res.statusText}`);
  }

  if (data !== null) {
    return data;
  }

  if (rawText) {
    try {
      return JSON.parse(rawText);
    } catch (e) {
      throw new Error("Server returned an invalid non-JSON response.");
    }
  }

  throw new Error("Empty response received from server.");
}

export const StudentConsole: React.FC<StudentConsoleProps> = ({
  onPhaseChange,
  onNavigateToApiPage,
}) => {
  const [hasCustomKey, setHasCustomKey] = useState<boolean>(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("edutn43_custom_api_key");
    setHasCustomKey(Boolean(savedKey && savedKey.trim()));
  }, []);

  // Form Setup state
  const [studentName, setStudentName] = useState("");
  const [taskMode, setTaskMode] = useState<"individual" | "class_assignment">("individual");
  const [assignmentCode, setAssignmentCode] = useState("");
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  const [framework, setFramework] = useState<CurriculumFramework>("MYP");
  const [classLevel, setClassLevel] = useState<string>("MYP3");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [mode, setMode] = useState<ModeType>("analogy");
  const [selectedStrands, setSelectedStrands] = useState<string[]>(DEFAULT_ANALOGY_STRANDS);
  const [showStrandPicker, setShowStrandPicker] = useState(false);

  // Flow State
  const [isGeneratingPackage, setIsGeneratingPackage] = useState(false);
  const [isLoadingAssignment, setIsLoadingLoadingAssignment] = useState(false);
  const [contextText, setContextText] = useState("");
  const [elements, setElements] = useState<ScenarioElement[]>([]);
  const [identifications, setIdentifications] = useState<Record<number, string>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [reflectionText, setReflectionText] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formativeNumber, setFormativeNumber] = useState<number>(1);

  const effectiveTopic = selectedTopic === "__custom__" ? customTopic : selectedTopic;

  // Auto update framework options when class level changes
  const handleFrameworkChange = (fw: CurriculumFramework) => {
    setFramework(fw);
    const available = CLASS_LEVELS.filter((c) => c.framework === fw);
    if (available.length > 0) {
      setClassLevel(available[0].code);
    }
  };

  // Toggle strands
  const toggleStrand = (code: string) => {
    if (selectedStrands.includes(code)) {
      if (selectedStrands.length <= 1) {
        alert("Please keep at least one target strand selected for assessment.");
        return;
      }
      setSelectedStrands(selectedStrands.filter((s) => s !== code));
    } else {
      setSelectedStrands([...selectedStrands, code]);
    }
  };

  // When mode changes, reset default strands if user hasn't customized much
  useEffect(() => {
    if (mode === "analogy") {
      setSelectedStrands(DEFAULT_ANALOGY_STRANDS);
    } else {
      setSelectedStrands(DEFAULT_SCENARIO_STRANDS);
    }
  }, [mode]);

  // Load Common Class Assignment
  const handleLoadClassAssignment = async (queryOverride?: string) => {
    const q = (queryOverride || assignmentCode || classLevel).trim();
    if (!q) {
      alert("Please enter a Class Code (e.g. MYP3) or Assignment Code.");
      return;
    }

    setErrorMessage("");
    setIsLoadingLoadingAssignment(true);

    try {
      const data = await safeFetchJson(`/api/student/assignments/${encodeURIComponent(q)}`, {
        method: "GET"
      });

      if (data && data.success && data.assignment) {
        const assign = data.assignment;
        setActiveAssignmentId(assign.id);
        setFramework(assign.framework || "MYP");
        setClassLevel(assign.classLevel || "MYP3");
        setSelectedTopic(assign.topic);
        setMode(assign.mode || "analogy");
        setSelectedStrands(assign.selectedStrands || DEFAULT_ANALOGY_STRANDS);
        setContextText(assign.contextText);
        setElements(assign.elements || []);

        const initIdent: Record<number, string> = {};
        (assign.elements || []).forEach((e: ScenarioElement) => {
          initIdent[e.id] = "";
        });
        setIdentifications(initIdent);
        setIsLocked(false);
        setReport(null);
        setReflectionText("");
        setReflectionSaved(false);
        onPhaseChange(1);
      } else {
        throw new Error(data.error || "Assignment not found.");
      }
    } catch (err: any) {
      console.error(err);
      // Fallback: Check local storage for teacher published task
      try {
        const stored = localStorage.getItem(`edutn43_assignment_${q.toUpperCase()}`) || localStorage.getItem(`edutn43_assignment_CLASS_${q.toUpperCase()}`);
        if (stored) {
          const assign = JSON.parse(stored);
          setActiveAssignmentId(assign.id);
          setFramework(assign.framework || "MYP");
          setClassLevel(assign.classLevel || "MYP3");
          setSelectedTopic(assign.topic);
          setMode(assign.mode || "analogy");
          setSelectedStrands(assign.selectedStrands || DEFAULT_ANALOGY_STRANDS);
          setContextText(assign.contextText);
          setElements(assign.elements || []);

          const initIdent: Record<number, string> = {};
          (assign.elements || []).forEach((e: ScenarioElement) => {
            initIdent[e.id] = "";
          });
          setIdentifications(initIdent);
          setIsLocked(false);
          setReport(null);
          setReflectionText("");
          setReflectionSaved(false);
          onPhaseChange(1);
          setIsLoadingLoadingAssignment(false);
          return;
        }
      } catch (e) {
        // ignore
      }
      setErrorMessage(err.message || `No common task found for '${q}'. Ask your teacher to publish the task.`);
    } finally {
      setIsLoadingLoadingAssignment(false);
    }
  };

  // Step 1: Generate Package (Analogy/Scenario + Answer Key)
  const handleGenerate = async () => {
    if (!studentName.trim()) {
      alert("Please enter your student name.");
      return;
    }
    if (!effectiveTopic.trim()) {
      alert("Please select or enter a science topic.");
      return;
    }

    setErrorMessage("");
    setIsGeneratingPackage(true);
    setActiveAssignmentId(null);
    setContextText("");
    setElements([]);
    setIdentifications({});
    setIsLocked(false);
    setReport(null);
    setReflectionText("");
    setReflectionSaved(false);
    onPhaseChange(1);

    try {
      const customKey = localStorage.getItem("edutn43_custom_api_key") || "";
      const data = await safeFetchJson("/api/generate-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-api-key": customKey.trim()
        },
        body: JSON.stringify({
          topic: effectiveTopic,
          mode,
          framework,
          classLevel,
          selectedStrands
        }),
      });

      setContextText(data.contextText);
      setElements(data.elements || []);
      const initIdent: Record<number, string> = {};
      (data.elements || []).forEach((e: ScenarioElement) => {
        initIdent[e.id] = "";
      });
      setIdentifications(initIdent);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to generate analogy/scenario. Please try again.");
    } finally {
      setIsGeneratingPackage(false);
    }
  };

  // Lock Identifications
  const handleLock = () => {
    const empty = elements.find((e) => !(identifications[e.id] || "").trim());
    if (empty) {
      if (!confirm(`Element ${empty.id} is left blank. Are you sure you want to lock in anyway?`)) {
        return;
      }
    }
    setIsLocked(true);
  };

  // Step 2: AI Correction & MYP Criteria Assessment
  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setErrorMessage("");
    onPhaseChange(2);

    // Calculate Formative Count for this student
    const studentKey = (studentName || "student").trim().toLowerCase();
    const countKey = `edutn43_formative_count_${studentKey}`;
    const previousCount = parseInt(localStorage.getItem(countKey) || "0", 10) || 0;
    const currentFormativeNumber = previousCount + 1;
    localStorage.setItem(countKey, currentFormativeNumber.toString());
    setFormativeNumber(currentFormativeNumber);

    const payload = elements.map((e) => ({
      id: e.id,
      elementLabel: e.elementLabel,
      correctMapping: e.correctMapping,
      studentIdentification: identifications[e.id] || "",
    }));

    try {
      const customKey = localStorage.getItem("edutn43_custom_api_key") || "";
      const data = await safeFetchJson("/api/ai-correct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-api-key": customKey.trim()
        },
        body: JSON.stringify({
          topic: effectiveTopic,
          mode,
          contextText,
          payload,
          framework,
          classLevel,
          selectedStrands
        }),
      });

      setReport(data);
      onPhaseChange(3);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Correction failed. Please try submitting again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  // Save Reflection
  const handleSaveReflection = () => {
    if (!reflectionText.trim()) return;
    setReflectionSaved(true);
  };

  // Helper for MYP criterion bands
  const getBand = (level: number) => {
    if (level >= 7) return "7-8 (Exceeding)";
    if (level >= 5) return "5-6 (Meeting)";
    if (level >= 3) return "3-4 (Developing)";
    return "1-2 (Beginning)";
  };

  // Exports
  const getSubmissionJson = (): StudentSubmission | null => {
    if (!report) return null;
    return {
      assignmentId: activeAssignmentId || undefined,
      studentName,
      topic: effectiveTopic,
      mode,
      framework,
      classLevel,
      selectedStrands,
      contextText,
      timestamp: new Date().toISOString(),
      elements,
      studentIdentifications: identifications,
      report: {
        ...report,
        reflectionText,
      },
      formativeNumber,
      formativeLabel: `AOL - Formative #${formativeNumber}`
    };
  };

  const handleExportJson = () => {
    const sub = getSubmissionJson();
    if (!sub) return;
    const jsonStr = JSON.stringify(sub, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, "_")}_${classLevel}_Formative${formativeNumber}_report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTxt = () => {
    if (!report) return;
    let txt = `EDUTN43 MODEL VS MODEL — DIAGNOSTIC REPORT\nASSESSMENT TYPE: AOL - Formative #${formativeNumber}\nStudent: ${studentName}\nClass Level: ${classLevel} (${framework})\nMode: ${mode.toUpperCase()}\nTopic: ${effectiveTopic}\nDate: ${new Date().toLocaleString()}\n\n`;
    txt += `--- ANALOGY / SCENARIO TEXT ---\n${contextText}\n\n`;
    txt += `--- STUDENT IDENTIFICATIONS ---\n`;
    elements.forEach((e) => {
      txt += `${e.id}. "${e.elementLabel}" -> Your Answer: ${identifications[e.id] || "(blank)"}\n`;
    });
    txt += `\n--- AI CORRECTION & DIAGNOSTICS ---\n`;
    txt += `Identified: ${report.identification.correctCount}/${report.identification.totalElements}\n\n`;
    report.identification.details.forEach((d) => {
      txt += `${d.id}. [${d.correct ? "CORRECT" : "INCORRECT"}] ${d.feedback}\n`;
    });
    txt += `\nOverall Feedback:\n${report.overallFeedback}\n\n`;
    if (report.criteria?.A) {
      txt += `--- MYP SCIENCES CRITERION A ---\nLevel: ${report.criteria.A.level}/8 (${getBand(report.criteria.A.level)})\nJustification: ${report.criteria.A.justification}\n\n`;
    }
    if (report.strandEvaluations && report.strandEvaluations.length > 0) {
      txt += `--- TARGET STRANDS EVALUATION ---\n`;
      report.strandEvaluations.forEach((st) => {
        txt += `• Strand ${st.strandCode} (${st.strandTitle}): Level ${st.level}/8 [${st.rating}]\n  Feedback: ${st.feedback}\n`;
      });
      txt += `\n`;
    }
    if (reflectionText) {
      txt += `--- REFLECTION ---\n${reflectionText}\n`;
    }

    const blob = new Blob([txt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, "_")}_${classLevel}_Formative${formativeNumber}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    if (!report) return;
    setIsExportingPdf(true);

    try {
      const jsPDF = (await import("jspdf")).default;
      const html2canvas = (await import("html2canvas")).default;

      const container = document.createElement("div");
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.top = "0";
      container.style.width = "750px";
      container.style.backgroundColor = "#F8FAFC";
      container.style.color = "#0F172A";
      container.style.fontFamily = "'IBM Plex Mono', monospace, sans-serif";
      container.style.padding = "28px";
      container.style.boxSizing = "border-box";

      const activeReflection = reflectionText || report.reflectionText || "";

      container.innerHTML = `
        <div style="border-bottom: 2px solid #1E3A8A; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #2563EB;">
              EduTN43 · ${framework} ${classLevel} Diagnostic Assessment
            </div>
            <h1 style="font-family: 'Spectral', serif; font-size: 24px; font-weight: bold; margin: 4px 0 0 0; color: #1E3A8A;">
              Model vs Model — Diagnostic Report
            </h1>
          </div>
          <div style="background: #1E3A8A; color: #ffffff; padding: 6px 14px; border-radius: 4px; font-size: 13px; font-weight: bold; font-family: monospace; letter-spacing: 1px; white-space: nowrap;">
            AOL - Formative #${formativeNumber}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; background: #ffffff; border: 1px solid #CBD5E1; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 11px; line-height: 1.6; color: #1E293B;">
          <div>
            <div><strong>Student Name:</strong> ${studentName}</div>
            <div><strong>Class / Year Group:</strong> ${classLevel} (${framework})</div>
            <div><strong>Science Topic:</strong> ${effectiveTopic}</div>
            <div><strong>Assessment Stage:</strong> <span style="color: #2563EB; font-weight: bold;">AOL - Formative #${formativeNumber}</span></div>
          </div>
          <div style="text-align: right;">
            <div><strong>Mode:</strong> ${mode.toUpperCase()}</div>
            <div><strong>Task Type:</strong> ${activeAssignmentId ? `Class Task (${activeAssignmentId})` : "Practice"}</div>
            <div><strong>Date:</strong> ${new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <!-- SCORES SUMMARY BOX -->
        <div style="background: #1E3A8A; color: #ffffff; padding: 16px; border-radius: 6px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #93C5FD;">
              Identification Score
            </div>
            <div style="font-size: 24px; font-weight: bold; font-family: 'Spectral', serif; color: #ffffff;">
              ${report.identification.correctCount} / ${report.identification.totalElements} Correct
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #93C5FD;">
              Criterion A Achievement
            </div>
            <div style="font-size: 22px; font-weight: bold; font-family: 'Spectral', serif; color: #ffffff;">
              Level ${report.criteria?.A?.level || 0} / 8 (${getBand(report.criteria?.A?.level || 1)})
            </div>
          </div>
        </div>

        <!-- STRAND EVALUATIONS -->
        ${
          report.strandEvaluations && report.strandEvaluations.length > 0
            ? `
          <div style="margin-bottom: 16px;">
            <div style="font-size: 11px; font-weight: bold; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-bottom: 8px; color: #1E3A8A; text-transform: uppercase;">
              Specific MYP Criteria & Strands Performance
            </div>
            ${report.strandEvaluations
              .map(
                (st) => `
              <div style="background: #ffffff; border: 1px solid #CBD5E1; padding: 8px 12px; border-radius: 4px; margin-bottom: 6px; font-size: 11px;">
                <div style="display: flex; justify-content: space-between; font-weight: bold; color: #1E3A8A;">
                  <span>Strand ${st.strandCode}: ${st.strandTitle}</span>
                  <span style="color: #2563EB;">Level ${st.level}/8 (${st.rating})</span>
                </div>
                <div style="color: #334155; margin-top: 2px;">${st.feedback}</div>
              </div>
            `
              )
              .join("")}
          </div>
        `
            : ""
        }

        <!-- ANALOGY / SCENARIO TEXT -->
        <div style="background: #ffffff; border: 1px solid #CBD5E1; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #2563EB; margin-bottom: 4px;">
            ${mode === "analogy" ? "Everyday Analogy Text" : "Observable Scenario Text"}
          </div>
          <div style="font-family: 'Spectral', serif; font-style: italic; font-size: 12px; line-height: 1.5; color: #0F172A;">
            "${contextText}"
          </div>
        </div>

        <!-- ITEM-BY-ITEM BREAKDOWN -->
        <div style="margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: bold; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-bottom: 8px; color: #1E3A8A; text-transform: uppercase;">
            Item-by-Item Diagnostic Correction
          </div>
          ${report.identification.details
            .slice()
            .sort((a, b) => a.id - b.id)
            .map((item) => {
              const elem = elements.find((e) => e.id === item.id);
              const ans = identifications[item.id] || "(blank)";
              return `
                <div style="background: ${item.correct ? "#F0FDF4" : "#FEF2F2"}; border: 1px solid ${item.correct ? "#16A34A" : "#DC2626"}; padding: 8px 10px; border-radius: 4px; margin-bottom: 6px; font-size: 11px;">
                  <div style="display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 2px; color: #0F172A;">
                    <span>Part ${item.id}: "${elem?.elementLabel || ""}"</span>
                    <span style="color: ${item.correct ? "#15803D" : "#DC2626"};">[${item.correct ? "CORRECT" : "INCORRECT"}]</span>
                  </div>
                  <div style="color: #475569; font-family: monospace; margin-bottom: 2px;">
                    <strong>Student Answer:</strong> ${ans}
                  </div>
                  <div style="color: #1E293B; line-height: 1.3;">
                    <strong>Feedback:</strong> ${item.feedback}
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>

        <!-- OVERALL FEEDBACK -->
        <div style="background: #ffffff; border: 1px solid #CBD5E1; padding: 12px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 11px; line-height: 1.5; color: #0F172A;">
          <div style="font-weight: bold; color: #2563EB; text-transform: uppercase; font-size: 10px; margin-bottom: 4px;">
            Overall Diagnostic Feedback
          </div>
          <div>${report.overallFeedback}</div>
        </div>

        <!-- REFLECTION SECTION -->
        <div style="background: #EEF2FF; border: 1.5px solid #4F46E5; padding: 12px 16px; border-radius: 6px; font-size: 11px; line-height: 1.5; color: #1E1B4B;">
          <div style="font-weight: bold; color: #4338CA; text-transform: uppercase; font-size: 10px; margin-bottom: 4px;">
            Student Reflection
          </div>
          <div>${activeReflection.trim() ? activeReflection : "(No reflection submitted yet)"}</div>
        </div>
      `;

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${studentName.replace(/\s+/g, "_")}_${classLevel}_report.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Failed to generate PDF. Please try using Export Text or Print.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleReset = () => {
    if (confirm("Start a new topic? Current unsaved work will be reset.")) {
      setContextText("");
      setElements([]);
      setIdentifications({});
      setIsLocked(false);
      setReport(null);
      setReflectionText("");
      setReflectionSaved(false);
      setActiveAssignmentId(null);
      onPhaseChange(1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-900 text-white rounded-md shadow-sm">
            <Columns2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-lg text-blue-950 flex items-center gap-2">
              <span>Diagnostic Workspace</span>
              <span className="text-xs bg-blue-100 text-blue-900 border border-blue-300 px-2 py-0.5 rounded font-mono font-bold">
                {classLevel} ({framework})
              </span>
            </h2>
            <p className="text-xs text-slate-600">
              Left: Student Work &amp; Text | Right: AI Criteria &amp; Strand Feedback
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToApiPage && (
            <button
              onClick={onNavigateToApiPage}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                hasCustomKey
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
              title="Click to manage personal API key & traffic settings"
            >
              <Key className="w-3 h-3 text-yellow-600" />
              <span>{hasCustomKey ? "Personal Key Active" : "Shared Server Key"}</span>
            </button>
          )}

          {contextText && (
            <>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-900 text-white rounded-full uppercase tracking-wider">
                {mode}
              </span>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                {effectiveTopic}
              </span>
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border-l-4 border-rose-600 p-4 text-xs text-rose-900 font-medium rounded-r shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-950">Diagnostic Generation Alert</p>
              <p className="text-rose-800">{errorMessage}</p>
            </div>
          </div>
          {onNavigateToApiPage && (
            <button
              onClick={onNavigateToApiPage}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3.5 py-2 rounded-lg text-xs transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-yellow-300" />
              <span>Configure Personal Key →</span>
            </button>
          )}
        </div>
      )}

      {/* Split Screen 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ================= LEFT PANEL: STUDENT WORKSPACE ================= */}
        <div className="space-y-6">
          {/* Setup Box (if no contextText generated yet) */}
          {!contextText && (
            <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm space-y-4">
              {/* Task Mode Toggle Tabs */}
              <div className="flex border-b border-slate-200 pb-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTaskMode("individual")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    taskMode === "individual"
                      ? "bg-blue-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>Individual Practice Task</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTaskMode("class_assignment")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    taskMode === "class_assignment"
                      ? "bg-blue-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-300" />
                  <span>Common Class Assignment</span>
                </button>
              </div>

              {/* STUDENT NAME (Always required) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex M."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* MODE A: INDIVIDUAL PRACTICE SETUP */}
              {taskMode === "individual" ? (
                <div className="space-y-4">
                  {/* Curriculum & Class Level Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                        <span>Curriculum</span>
                      </label>
                      <select
                        value={framework}
                        onChange={(e) => handleFrameworkChange(e.target.value as CurriculumFramework)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {CURRICULUM_FRAMEWORKS.map((fw) => (
                          <option key={fw.code} value={fw.code}>
                            {fw.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Year Group / Class
                      </label>
                      <select
                        value={classLevel}
                        onChange={(e) => setClassLevel(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {CLASS_LEVELS.filter((c) => c.framework === framework).map((cl) => (
                          <option key={cl.code} value={cl.code}>
                            {cl.label} ({cl.gradeDescription})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Topic Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Science Topic
                    </label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">— Select a Topic —</option>
                      {PRESET_TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                      <option value="__custom__">Other (Type my own topic)</option>
                    </select>
                  </div>

                  {selectedTopic === "__custom__" && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                        Custom Science Topic
                      </label>
                      <input
                        type="text"
                        value={customTopic}
                        onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="e.g. Plate Tectonics & Earthquake Waves"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  )}

                  {/* Mode Select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Core Diagnostic Mode
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        onClick={() => setMode("analogy")}
                        className={`p-3 border rounded-lg cursor-pointer transition-all flex flex-col justify-between ${
                          mode === "analogy"
                            ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600"
                            : "bg-white border-slate-300 hover:border-blue-600"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-blue-950 mb-1">
                          <span className="text-base">🔗</span>
                          <span>Analogy Mode</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          AI writes an everyday analogy tailored for {classLevel}. You map the 6 parts to scientific terms.
                        </p>
                      </label>

                      <label
                        onClick={() => setMode("scenario")}
                        className={`p-3 border rounded-lg cursor-pointer transition-all flex flex-col justify-between ${
                          mode === "scenario"
                            ? "bg-blue-50 border-blue-600 ring-1 ring-blue-600"
                            : "bg-white border-slate-300 hover:border-blue-600"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-bold text-xs text-blue-950 mb-1">
                          <span className="text-base">📘</span>
                          <span>Scenario Mode</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          AI writes a real-world scenario tailored for {classLevel}. You explain the science behind 6 key moments.
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Criteria & Strands Alignment Dropdown */}
                  <div className="border border-blue-200 rounded-lg overflow-hidden bg-blue-50/30">
                    <button
                      type="button"
                      onClick={() => setShowStrandPicker(!showStrandPicker)}
                      className="w-full p-3 flex items-center justify-between text-left text-xs font-bold text-blue-950 hover:bg-blue-100/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-blue-700" />
                        <span>Targeted MYP Criteria &amp; Strands ({selectedStrands.length} Selected)</span>
                      </div>
                      {showStrandPicker ? (
                        <ChevronUp className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      )}
                    </button>

                    {showStrandPicker && (
                      <div className="p-3 bg-white border-t border-blue-200 space-y-3 text-xs">
                        <p className="text-[11px] text-slate-600">
                          Select the specific MYP criteria strands you want the AI to evaluate in your report:
                        </p>

                        {(["A", "B", "C", "D"] as const).map((critKey) => {
                          const crit = MYP_CRITERIA_DEFINITIONS[critKey];
                          return (
                            <div key={critKey} className="space-y-1.5 border-b border-slate-100 pb-2">
                              <span className="font-bold text-blue-950 text-[11px]">
                                {crit.title}
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {crit.strands.map((st) => {
                                  const isChecked = selectedStrands.includes(st.code);
                                  return (
                                    <label
                                      key={st.code}
                                      onClick={() => toggleStrand(st.code)}
                                      className={`p-2 rounded border flex items-start gap-2 cursor-pointer transition-all ${
                                        isChecked
                                          ? "bg-blue-50 border-blue-400 text-blue-950"
                                          : "bg-slate-50 border-slate-200 text-slate-600 opacity-70"
                                      }`}
                                    >
                                      {isChecked ? (
                                        <CheckSquare className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                      ) : (
                                        <Square className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                      )}
                                      <div>
                                        <span className="font-bold text-[11px] font-mono block">
                                          {st.code}: {st.title}
                                        </span>
                                        <span className="text-[10px] text-slate-500 block leading-tight">
                                          {st.description}
                                        </span>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGeneratingPackage}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingPackage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating {classLevel} Task...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300" />
                        <span>Generate &amp; Begin Task ({classLevel})</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* MODE B: CLASS ASSIGNMENT LOADING */
                <div className="space-y-4 bg-blue-50/50 p-4 border border-blue-200 rounded-lg">
                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-bold text-blue-950 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-700" />
                      <span>Load Class Assignment</span>
                    </p>
                    <p>
                      Enter your Class Code (e.g. <strong className="text-blue-900">MYP3</strong>, <strong className="text-blue-900">FM2</strong>) or Assignment Code assigned by your teacher.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={assignmentCode}
                      onChange={(e) => setAssignmentCode(e.target.value)}
                      placeholder="e.g. MYP3 or TASK-MYP3-BIO"
                      className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={() => handleLoadClassAssignment()}
                      disabled={isLoadingAssignment || !studentName.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded text-xs transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isLoadingAssignment ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <BookOpen className="w-4 h-4" />
                      )}
                      <span>Fetch Task</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-blue-200 text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                    <span>Quick Select Class:</span>
                    {["MYP1", "MYP2", "MYP3", "MYP4", "MYP5", "FM3", "IBDP1"].map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setAssignmentCode(c);
                          handleLoadClassAssignment(c);
                        }}
                        className="bg-white border border-blue-300 text-blue-900 font-bold px-2 py-0.5 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Generated Text & Identification Form */}
          {contextText && (
            <div className="space-y-6">
              {/* Context Manuscript Card */}
              <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 mb-3 gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mode === "analogy" ? "Everyday Analogy" : "Observable Scenario"} ({classLevel})</span>
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-xs text-slate-500 hover:text-blue-700 underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Start New Task
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-4 font-serif text-base text-slate-900 leading-relaxed italic shadow-inner">
                  "{contextText}"
                </div>

                {/* Target Strands Pills */}
                {selectedStrands && selectedStrands.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Target Strands:
                    </span>
                    {selectedStrands.map((st) => (
                      <span key={st} className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                        {st}
                      </span>
                    ))}
                  </div>
                )}

                {isLocked && (
                  <div className="mt-3 flex items-center justify-end">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-600 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider transform -rotate-1 shadow-sm">
                      <Lock className="w-3 h-3" />
                      <span>Sealed &amp; Locked</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Phase 1: Identifications Form */}
              <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-blue-950 flex items-center gap-2">
                      <span>Phase 1 — Identify the Parts</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      For each numbered element below, identify what it actually represents in{" "}
                      <strong className="text-blue-900">{effectiveTopic}</strong>.
                    </p>
                  </div>
                  <span className="text-xs font-bold bg-blue-900 text-white px-2.5 py-1 rounded-full">
                    6 Parts
                  </span>
                </div>

                <div className="space-y-3">
                  {elements.map((elem) => (
                    <div
                      key={elem.id}
                      className="bg-slate-50/50 border border-slate-200 rounded p-3.5 space-y-2 transition-all hover:border-blue-400"
                    >
                      <div className="flex items-start gap-2 text-sm font-semibold text-slate-900">
                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {elem.id}
                        </span>
                        <span className="font-serif italic text-base text-blue-950">"{elem.elementLabel}"</span>
                      </div>

                      <input
                        type="text"
                        disabled={isLocked}
                        value={identifications[elem.id] || ""}
                        onChange={(e) =>
                          setIdentifications({
                            ...identifications,
                            [elem.id]: e.target.value,
                          })
                        }
                        placeholder="What does this represent scientifically, and why?"
                        className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-75 disabled:cursor-not-allowed"
                      />
                    </div>
                  ))}
                </div>

                {!isLocked ? (
                  <button
                    onClick={handleLock}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer mt-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock My Identifications</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-800 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Identifications Locked. Ready for AI Evaluation!
                    </span>
                    <button
                      onClick={() => setIsLocked(false)}
                      disabled={!!report}
                      className="text-[11px] underline text-blue-900 disabled:hidden cursor-pointer"
                    >
                      Unlock to Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Phase 3: Reflection Section (shows once evaluation report is ready) */}
              {report && (
                <div className="bg-white border border-indigo-200 rounded-lg p-5 shadow-sm space-y-3">
                  <div className="border-b border-slate-200 pb-2">
                    <h3 className="font-serif font-bold text-lg text-indigo-950 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-indigo-600" />
                      <span>Phase 3 — Student Reflection</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      {report.identification.correctCount < 6
                        ? "Look back at what you got wrong. Why do you think you made that mistake, and what does it show about your understanding?"
                        : "You identified everything correctly! Reflect: which part required the deepest scientific reasoning?"}
                    </p>
                  </div>

                  <textarea
                    rows={3}
                    disabled={reflectionSaved}
                    value={reflectionText}
                    onChange={(e) => setReflectionText(e.target.value)}
                    placeholder="Write 2-3 reflective sentences here..."
                    className="w-full bg-slate-50 border border-slate-300 rounded p-3 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-80"
                  />

                  {!reflectionSaved ? (
                    <button
                      onClick={handleSaveReflection}
                      disabled={!reflectionText.trim()}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Save Reflection</span>
                    </button>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Reflection Saved. Submission complete!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= RIGHT PANEL: AI DIAGNOSTIC CONSOLE ================= */}
        <div className="space-y-6">
          {/* Header Card for AI Console */}
          <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="font-serif font-bold text-lg text-blue-950">
                  AI Diagnostic Console
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                {classLevel} Criteria Engine
              </span>
            </div>

            {/* State 1: No context generated yet */}
            {!contextText && (
              <div className="py-12 px-6 text-center space-y-3 bg-slate-50/50 border border-dashed border-blue-200 rounded-lg">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h4 className="font-serif font-bold text-base text-blue-950">
                  Awaiting Diagnostic Session
                </h4>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Select your year group/class and topic on the left panel to generate a custom Analogy or Scenario task.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-2 text-[11px] font-mono text-slate-600">
                  <span className="bg-white border border-slate-200 px-2 py-1 rounded shadow-xs">
                    ✓ Year Group Adapted (FM1-5, MYP1-5, IBDP1-2)
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-1 rounded shadow-xs">
                    ✓ MYP Strands (A, B, C, D)
                  </span>
                  <span className="bg-white border border-slate-200 px-2 py-1 rounded shadow-xs">
                    ✓ PDF &amp; JSON Export
                  </span>
                </div>
              </div>
            )}

            {/* State 2: Generated & waiting for lock/submission */}
            {contextText && !report && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-950">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Task Ready for Completion</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fill in your answers for all 6 parts on the left panel, then lock your identifications to run the AI diagnostic evaluation against {classLevel} strands.
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                    Selected Assessment Strands
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedStrands.map((st) => (
                      <span key={st} className="text-xs font-bold font-mono bg-white border border-blue-300 text-blue-900 px-2 py-0.5 rounded">
                        {st}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleEvaluate}
                  disabled={!isLocked || isEvaluating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-sm transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Against {classLevel} Strands...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit for AI Correction</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* State 3: AI Diagnostic Report Available */}
            {report && (
              <div className="space-y-5">
                {/* Formative Header Badge */}
                <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white p-3.5 rounded-lg flex items-center justify-between shadow-md border border-blue-700/80">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 font-mono font-black text-xs px-2.5 py-1 rounded shadow-xs tracking-wider uppercase">
                      AOL - Formative #{formativeNumber}
                    </span>
                    <span className="text-xs font-serif font-bold text-blue-100">
                      Assessment Attempt #{formativeNumber}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-200 bg-blue-950/60 border border-blue-700/60 px-2 py-0.5 rounded">
                    {studentName || "Student"} · {classLevel}
                  </span>
                </div>

                {/* Score Header */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 rounded-lg flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                      Identification Score
                    </span>
                    <div className="font-serif font-bold text-3xl">
                      {report.identification.correctCount} / {report.identification.totalElements}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                      Criterion A Achievement
                    </span>
                    <div className="font-serif font-bold text-2xl text-blue-100">
                      Level {report.criteria?.A?.level || "—"} / 8
                    </div>
                    <span className="text-[10px] font-mono bg-white/20 text-white px-2 py-0.5 rounded">
                      {getBand(report.criteria?.A?.level || 1)}
                    </span>
                  </div>
                </div>

                {/* MYP Criteria & Strands Breakdown Cards */}
                {report.strandEvaluations && report.strandEvaluations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-200 pb-1 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-700" />
                      <span>Strand-by-Strand Feedback ({classLevel})</span>
                    </h4>

                    <div className="space-y-2">
                      {report.strandEvaluations.map((st) => (
                        <div key={st.strandCode} className="bg-blue-50/60 border border-blue-200 rounded-lg p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-blue-950 flex items-center gap-1.5">
                              <Tag className="w-3.5 h-3.5 text-blue-600" />
                              <span>Strand {st.strandCode}: {st.strandTitle}</span>
                            </span>
                            <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                              st.level >= 7 ? "bg-emerald-600 text-white" :
                              st.level >= 5 ? "bg-blue-600 text-white" :
                              st.level >= 3 ? "bg-amber-600 text-white" : "bg-rose-600 text-white"
                            }`}>
                              Level {st.level}/8 · {st.rating}
                            </span>
                          </div>
                          <p className="text-xs text-slate-800 leading-relaxed pt-0.5">
                            {st.feedback}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Item-by-item Correction Details */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-200 pb-1">
                    Detailed Item-by-Item Correction
                  </h4>

                  {report.identification.details
                    .slice()
                    .sort((a, b) => a.id - b.id)
                    .map((item) => {
                      const elem = elements.find((e) => e.id === item.id);
                      return (
                        <div
                          key={item.id}
                          className={`border rounded-lg p-3 space-y-1.5 text-xs transition-all ${
                            item.correct
                              ? "bg-emerald-50/70 border-emerald-300"
                              : "bg-rose-50/70 border-rose-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              Part {item.id}: "{elem?.elementLabel}"
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                item.correct
                                  ? "bg-emerald-600 text-white"
                                  : "bg-rose-600 text-white"
                              }`}
                            >
                              {item.correct ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" /> Correct
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" /> Incorrect
                                </>
                              )}
                            </span>
                          </div>

                          <div className="text-slate-600 font-mono">
                            <strong>Your Answer:</strong> {identifications[item.id] || "(blank)"}
                          </div>

                          <div className="text-slate-800 leading-relaxed">
                            {item.feedback}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Overall AI Feedback */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    Overall Diagnostic Summary
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {report.overallFeedback}
                  </p>
                </div>

                {/* Export Options */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Export Options
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={handleExportPdf}
                      disabled={isExportingPdf}
                      className="bg-blue-900 hover:bg-blue-950 text-white font-bold py-2 px-2 rounded text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isExportingPdf ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Export PDF</span>
                    </button>

                    <button
                      onClick={handleExportJson}
                      className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-2 rounded text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileJson className="w-3.5 h-3.5" />
                      <span>Save JSON</span>
                    </button>

                    <button
                      onClick={handleExportTxt}
                      className="bg-slate-100 border border-slate-300 text-slate-800 font-bold py-2 px-2 rounded text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Text File</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
