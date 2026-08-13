import React, { useState, useRef, useEffect } from "react";
import { StudentSubmission, CommonClassAssignment, ScenarioElement } from "../types";
import {
  CurriculumFramework,
  CURRICULUM_FRAMEWORKS,
  CLASS_LEVELS,
  MYP_CRITERIA_DEFINITIONS,
  DEFAULT_ANALOGY_STRANDS,
  DEFAULT_SCENARIO_STRANDS
} from "../constants/rubrics";
import {
  UploadCloud,
  FileSpreadsheet,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Award,
  Users,
  BrainCircuit,
  PlusCircle,
  Copy,
  Sparkles,
  Loader2,
  Share2,
  Check,
  Tag,
  Filter,
  Lock,
  Key,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle
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

export const TeacherSummary: React.FC = () => {
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common Task Creator State
  const [showTaskCreator, setShowTaskCreator] = useState(false);
  const [teacherName, setTeacherName] = useState("Science Teacher");
  const [teacherPassword, setTeacherPassword] = useState(() => localStorage.getItem("edutn43_teacher_password") || "TEACHER123");
  const [showPassword, setShowPassword] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const [taskFramework, setTaskFramework] = useState<CurriculumFramework>("MYP");
  const [taskClassLevel, setTaskClassLevel] = useState<string>("MYP3");
  const [taskTopic, setTaskTopic] = useState("Cell Structure & Function");
  const [taskCustomTopic, setTaskCustomTopic] = useState("");
  const [taskMode, setTaskMode] = useState<"analogy" | "scenario">("analogy");
  const [taskStrands, setTaskStrands] = useState<string[]>(DEFAULT_ANALOGY_STRANDS);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedTasks, setPublishedTasks] = useState<CommonClassAssignment[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Load active assignments on mount
  useEffect(() => {
    fetchActiveAssignments();
  }, []);

  const fetchActiveAssignments = async () => {
    try {
      const res = await fetch("/api/teacher/assignments");
      if (res.ok) {
        const data = await res.json();
        if (data && data.assignments) {
          setPublishedTasks(data.assignments);
        }
      }
    } catch (e) {
      console.error("Failed to load published assignments:", e);
    }
  };

  const handleFrameworkChange = (fw: CurriculumFramework) => {
    setTaskFramework(fw);
    const available = CLASS_LEVELS.filter((c) => c.framework === fw);
    if (available.length > 0) {
      setTaskClassLevel(available[0].code);
    }
  };

  const toggleTaskStrand = (code: string) => {
    if (taskStrands.includes(code)) {
      if (taskStrands.length <= 1) return;
      setTaskStrands(taskStrands.filter((s) => s !== code));
    } else {
      setTaskStrands([...taskStrands, code]);
    }
  };

  // Generate & Publish Common Task
  const handleCreateCommonTask = async () => {
    setPasscodeError("");
    const effectiveTopic = taskTopic === "__custom__" ? taskCustomTopic : taskTopic;
    if (!effectiveTopic.trim()) {
      alert("Please specify a topic for the common class assignment.");
      return;
    }

    if (!teacherPassword || !teacherPassword.trim()) {
      setPasscodeError("Teacher Access Password is required to assign a common class task.");
      return;
    }

    setIsPublishing(true);
    try {
      // Step 1: Generate package
      const customKey = localStorage.getItem("edutn43_custom_api_key") || "";
      const genRes = await fetch("/api/generate-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-custom-api-key": customKey.trim()
        },
        body: JSON.stringify({
          topic: effectiveTopic,
          mode: taskMode,
          framework: taskFramework,
          classLevel: taskClassLevel,
          selectedStrands: taskStrands
        })
      });

      if (!genRes.ok) {
        throw new Error("Failed to generate task scenario from AI model.");
      }

      const pkg = await genRes.json();
      const assignmentId = `TASK-${taskClassLevel}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const payload = {
        id: assignmentId,
        title: `${taskClassLevel} ${effectiveTopic} Common Task`,
        teacherName,
        teacherPassword: teacherPassword.trim(),
        framework: taskFramework,
        classLevel: taskClassLevel,
        topic: effectiveTopic,
        mode: taskMode,
        selectedStrands: taskStrands,
        contextText: pkg.contextText,
        elements: pkg.elements
      };

      // Publish to server endpoint
      const pubRes = await fetch("/api/teacher/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-teacher-password": teacherPassword.trim()
        },
        body: JSON.stringify(payload)
      });

      if (pubRes.ok) {
        const pubData = await pubRes.json();
        const assign = pubData.assignment;
        localStorage.setItem("edutn43_teacher_password", teacherPassword.trim());
        setPublishedTasks((prev) => [assign, ...prev.filter((t) => t.id !== assign.id)]);
        // Save in localStorage as backup
        localStorage.setItem(`edutn43_assignment_${assign.id}`, JSON.stringify(assign));
        localStorage.setItem(`edutn43_assignment_CLASS_${taskClassLevel.toUpperCase()}`, JSON.stringify(assign));
        alert(`Common Task Published Successfully! Assignment Code: ${assign.id}`);
        setShowTaskCreator(false);
      } else {
        const errData = await pubRes.json().catch(() => ({}));
        if (pubRes.status === 401) {
          setPasscodeError("Incorrect Teacher Password. Access denied for common task publishing.");
          throw new Error("Incorrect Teacher Password. Access restricted to verified teaching staff.");
        }
        throw new Error(errData.error || "Failed to save published assignment to server.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to publish assignment.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string);
          if (parsed.studentName && parsed.report) {
            setSubmissions((prev) => {
              const idx = prev.findIndex(
                (s) => s.studentName === parsed.studentName && s.topic === parsed.topic
              );
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = parsed;
                return next;
              }
              return [...prev, parsed];
            });
          }
        } catch (err) {
          console.error("Failed to parse student JSON:", file.name, err);
        }
      };
      reader.readAsText(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDownloadCsv = () => {
    if (submissions.length === 0) return;
    let csv =
      "Student Name,Formative Assessment,Framework,Class Level,Topic,Mode,Identified Correct,Total Elements,Criterion A Level,Strand Evaluations,Timestamp\n";
    submissions.forEach((sub) => {
      const ident = sub.report.identification || { correctCount: 0, totalElements: 6 };
      const level = sub.report.criteria?.A?.level || "";
      const fw = sub.framework || "MYP";
      const cl = sub.classLevel || "MYP3";
      const formLabel = sub.formativeLabel || `AOL - Formative #${sub.formativeNumber || 1}`;
      const strBreakdown = sub.report.strandEvaluations
        ? sub.report.strandEvaluations.map((st) => `${st.strandCode}:${st.level}/8`).join("; ")
        : "";
      const ts = sub.timestamp ? new Date(sub.timestamp).toLocaleString() : "";
      csv += `"${sub.studentName}","${formLabel}","${fw}","${cl}","${sub.topic}","${sub.mode}",${ident.correctCount},${ident.totalElements},${level},"${strBreakdown}","${ts}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `class_diagnostic_summary_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter Submissions
  const filteredSubmissions = submissions.filter((s) => {
    if (classFilter === "ALL") return true;
    return (s.classLevel || "MYP3").toUpperCase() === classFilter.toUpperCase();
  });

  // Class Stats
  const totalCount = filteredSubmissions.length;
  const avgIdentified =
    totalCount > 0
      ? (
          filteredSubmissions.reduce(
            (acc, s) => acc + (s.report?.identification?.correctCount || 0),
            0
          ) / totalCount
        ).toFixed(1)
      : "0.0";

  const validCriterionASubs = filteredSubmissions.filter((s) => s.report?.criteria?.A?.level !== undefined);
  const avgCriterionA =
    validCriterionASubs.length > 0
      ? (
          validCriterionASubs.reduce(
            (acc, s) => acc + (s.report?.criteria?.A?.level || 0),
            0
          ) / validCriterionASubs.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="font-serif font-bold text-xl text-blue-950 flex items-center gap-2">
              <span className="font-sans text-xs bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded">EduTN43</span>
              <Users className="w-5 h-5 text-blue-600" />
              <span>Teacher Summary &amp; Class Task Manager</span>
            </h2>
            <p className="text-xs text-slate-600">
              Publish common tasks to specific classes (FM1-5, MYP1-5, IBDP1-2) and view aggregate cohort analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowTaskCreator(!showTaskCreator)}
              className="bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs py-2 px-3 rounded.lg flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-yellow-300" />
              <span>{showTaskCreator ? "Close Task Creator" : "+ Create Common Class Task"}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              disabled={submissions.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-3 rounded flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Gradebook CSV</span>
            </button>

            {submissions.length > 0 && (
              <button
                onClick={() => setSubmissions([])}
                className="bg-white border border-rose-300 text-rose-700 hover:bg-rose-600 hover:text-white font-semibold text-xs py-2 px-3 rounded flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* COMMON TASK CREATOR DRAWER */}
        {showTaskCreator && (
          <div className="bg-blue-50/70 border-2 border-blue-600 rounded-lg p-4 space-y-4 shadow-sm animate-fadeIn">
            <div className="border-b border-blue-200 pb-2 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-blue-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-600" />
                  <span>Configure &amp; Assign Common Class Task</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Every student in the assigned year group class will work on this exact same scenario &amp; questions.
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-900 text-white px-2 py-0.5 rounded">
                Locked Cohort Task
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher Name</label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Curriculum</label>
                <select
                  value={taskFramework}
                  onChange={(e) => handleFrameworkChange(e.target.value as CurriculumFramework)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                >
                  {CURRICULUM_FRAMEWORKS.map((fw) => (
                    <option key={fw.code} value={fw.code}>
                      {fw.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Class / Year Group</label>
                <select
                  value={taskClassLevel}
                  onChange={(e) => setTaskClassLevel(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                >
                  {CLASS_LEVELS.filter((c) => c.framework === taskFramework).map((cl) => (
                    <option key={cl.code} value={cl.code}>
                      {cl.label} ({cl.gradeDescription})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Science Topic</label>
                <select
                  value={taskTopic}
                  onChange={(e) => setTaskTopic(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                >
                  {PRESET_TOPICS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="__custom__">Other (Custom Topic)</option>
                </select>
              </div>

              {taskTopic === "__custom__" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Custom Topic Name</label>
                  <input
                    type="text"
                    value={taskCustomTopic}
                    onChange={(e) => setTaskCustomTopic(e.target.value)}
                    placeholder="e.g. Acid-Base Neutralization"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnostic Mode</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTaskMode("analogy")}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-bold border transition-all cursor-pointer ${
                      taskMode === "analogy"
                        ? "bg-blue-900 text-white border-blue-950"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    🔗 Analogy Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaskMode("scenario")}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-bold border transition-all cursor-pointer ${
                      taskMode === "scenario"
                        ? "bg-blue-900 text-white border-blue-950"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    📘 Scenario Mode
                  </button>
                </div>
              </div>
            </div>

            {/* Target Strands Selection for Task */}
            <div className="space-y-1.5 text-xs">
              <label className="block font-bold text-slate-700">Target Strands to Assess for this Assignment</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {["A(i)", "A(ii)", "A(iii)", "B(i)", "C(ii)", "D(i)", "D(iii)"].map((code) => {
                  const isChecked = taskStrands.includes(code);
                  return (
                    <button
                      type="button"
                      key={code}
                      onClick={() => toggleTaskStrand(code)}
                      className={`p-1.5 rounded border text-[11px] font-mono font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isChecked
                          ? "bg-blue-900 text-white border-blue-950"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      <span>Strand {code}</span>
                      <span>{isChecked ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TEACHER ACCESS PASSWORD VERIFICATION */}
            <div className="bg-amber-50/90 border border-amber-300/90 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Teacher Access Password (Required to Publish)</span>
                </label>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-200/80 border border-amber-300 px-2 py-0.5 rounded font-bold">
                  Default: TEACHER123
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={teacherPassword}
                  onChange={(e) => {
                    setTeacherPassword(e.target.value);
                    setPasscodeError("");
                  }}
                  placeholder="Enter Teacher Passcode"
                  className="w-full bg-white border border-amber-300 rounded px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer p-1"
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {passcodeError && (
                <p className="text-[11px] text-rose-700 font-bold flex items-center gap-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{passcodeError}</span>
                </p>
              )}
              <p className="text-[11px] text-amber-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                <span>Security Gate: Prevents students from creating or assigning common class assignments.</span>
              </p>
            </div>

            <button
              onClick={handleCreateCommonTask}
              disabled={isPublishing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Common Task for {taskClassLevel}...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-yellow-300" />
                  <span>Publish Common Task to {taskClassLevel} Cohort</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* ACTIVE PUBLISHED CLASS TASKS */}
        {publishedTasks.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
            <h4 className="font-serif font-bold text-xs uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Active Common Class Tasks ({publishedTasks.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {publishedTasks.map((t) => (
                <div key={t.id} className="bg-white border border-blue-200 p-3 rounded-lg shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950">{t.title}</span>
                    <span className="font-mono text-[10px] bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded">
                      {t.classLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 italic">"{t.contextText.slice(0, 90)}..."</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    <span className="font-mono text-slate-500">Code: <strong className="text-blue-900">{t.id}</strong></span>
                    <button
                      onClick={() => handleCopyCode(t.id)}
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode === t.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drag and Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 hover:border-blue-600 bg-blue-50/40 rounded-lg p-6 text-center cursor-pointer transition-all space-y-2 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".json,application/json"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white mx-auto flex items-center justify-center transition-all">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-blue-950">
            Drag &amp; drop student .json files here, or click to browse
          </p>
          <p className="text-[11px] text-slate-500">
            Supports bulk upload of student export files from the EduTN43 console.
          </p>
        </div>
      </div>

      {/* Aggregate Statistics & Filters */}
      {submissions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white border border-blue-200 p-3 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-700" />
              <span className="font-bold text-slate-800">Filter by Class Cohort:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setClassFilter("ALL")}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                  classFilter === "ALL" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                All Submissions ({submissions.length})
              </button>
              {Array.from(new Set(submissions.map((s) => (s.classLevel || "MYP3").toUpperCase()))).map((cl) => (
                <button
                  key={cl}
                  onClick={() => setClassFilter(cl)}
                  className={`px-2 py-1 rounded text-xs font-bold font-mono transition-all cursor-pointer ${
                    classFilter === cl ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {cl}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Cohort Reports
              </span>
              <div className="font-serif font-bold text-3xl text-blue-900">
                {totalCount}
              </div>
            </div>

            <div className="bg-blue-100/60 border border-blue-300 rounded-lg p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                Avg Identified Correct
              </span>
              <div className="font-serif font-bold text-3xl text-blue-950">
                {avgIdentified} <span className="text-sm font-normal text-slate-600">/ 6</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Avg Criterion A Level
              </span>
              <div className="font-serif font-bold text-3xl text-emerald-800">
                {avgCriterionA} <span className="text-sm font-normal text-slate-600">/ 8</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table of Submissions */}
      <div className="bg-white border border-blue-200 rounded-lg overflow-hidden shadow-sm">
        {filteredSubmissions.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-slate-500 space-y-1">
            <p className="font-bold text-slate-800">No Student Reports Uploaded Yet</p>
            <p>Exported student .json files will populate this class overview table automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-900 border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class &amp; Framework</th>
                  <th className="py-3 px-4">Topic &amp; Mode</th>
                  <th className="py-3 px-4">Identified</th>
                  <th className="py-3 px-4">Criterion A</th>
                  <th className="py-3 px-4">Reflection</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubmissions.map((sub, idx) => {
                  const isExpanded = expandedIndex === idx;
                  const ident = sub.report.identification || { correctCount: 0, totalElements: 6 };
                  const level = sub.report.criteria?.A?.level || 0;

                  return (
                    <React.Fragment key={idx}>
                      <tr className="bg-white hover:bg-blue-50/50 transition-colors">
                        <td className="py-3 px-4 text-slate-900">
                          <div className="font-bold text-sm">{sub.studentName}</div>
                          <div className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded inline-block mt-0.5">
                            {sub.formativeLabel || `AOL - Formative #${sub.formativeNumber || 1}`}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
                            {sub.classLevel || "MYP3"} ({sub.framework || "MYP"})
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-blue-900">{sub.topic}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-mono">
                            {sub.mode}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                            {ident.correctCount} / {ident.totalElements}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-bold font-mono">
                            Level {level} / 8
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {sub.report.reflectionText ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                            className="p-1.5 bg-slate-100 hover:bg-blue-900 hover:text-white rounded border border-slate-300 transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-blue-50/30">
                          <td colSpan={7} className="p-4 space-y-4">
                            <div className="bg-white border border-blue-200 rounded-lg p-4 space-y-3 shadow-sm">
                              <h4 className="font-serif font-bold text-sm text-blue-950 border-b border-slate-200 pb-2 flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-700" />
                                <span>Diagnostic Breakdown for {sub.studentName} ({sub.classLevel})</span>
                              </h4>

                              {/* Analogy Text */}
                              <div className="text-xs italic font-serif text-slate-700 bg-slate-50 p-3 rounded border border-slate-200">
                                "{sub.contextText}"
                              </div>

                              {/* Strand breakdown if present */}
                              {sub.report.strandEvaluations && sub.report.strandEvaluations.length > 0 && (
                                <div className="space-y-1.5 pt-1">
                                  <strong className="text-xs text-blue-900 block font-mono uppercase">
                                    Target Strands Evaluation:
                                  </strong>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {sub.report.strandEvaluations.map((st) => (
                                      <div key={st.strandCode} className="p-2 bg-blue-50 border border-blue-200 rounded">
                                        <div className="flex justify-between font-mono font-bold text-blue-950">
                                          <span>Strand {st.strandCode}: {st.strandTitle}</span>
                                          <span>Level {st.level}/8 ({st.rating})</span>
                                        </div>
                                        <p className="text-[11px] text-slate-700 mt-1">{st.feedback}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Item Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-2">
                                {sub.report.identification?.details?.map((item) => {
                                  const elem = sub.elements.find((e) => e.id === item.id);
                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-2.5 rounded border ${
                                        item.correct
                                          ? "bg-emerald-50/60 border-emerald-300 text-emerald-950"
                                          : "bg-rose-50/60 border-rose-300 text-rose-950"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between font-bold mb-1">
                                        <span>Part {item.id}: "{elem?.elementLabel}"</span>
                                        <span className="text-[10px]">
                                          {item.correct ? "✓ Correct" : "✕ Incorrect"}
                                        </span>
                                      </div>
                                      <p className="font-mono text-[11px] text-slate-600">
                                        Answer: {sub.studentIdentifications?.[item.id] || "(blank)"}
                                      </p>
                                      <p className="text-[11px] text-slate-800 mt-1">
                                        {item.feedback}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Student Reflection */}
                              {sub.report.reflectionText && (
                                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded text-xs text-slate-800">
                                  <strong className="text-indigo-900 block mb-1 flex items-center gap-1">
                                    <BrainCircuit className="w-3.5 h-3.5 text-indigo-700" />
                                    Student Reflection:
                                  </strong>
                                  {sub.report.reflectionText}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
