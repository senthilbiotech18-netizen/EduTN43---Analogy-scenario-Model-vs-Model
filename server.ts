import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Helper to clean response JSON string
function cleanAndParseJson(text: string): any {
  if (!text) {
    throw new Error("AI generated an empty response. Please try generating again.");
  }
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        // fall through
      }
    }
    throw new Error("Failed to parse AI response as valid JSON. Please try clicking Generate again.");
  }
}

// Helper to get GoogleGenAI client (using custom API key if provided by student, else server fallback)
function getGeminiClient(req: express.Request): GoogleGenAI {
  const customKey =
    (req.headers["x-custom-api-key"] as string) ||
    (req.body && req.body.customApiKey);

  const apiKey = customKey && customKey.trim() !== "" ? customKey.trim() : process.env.GEMINI_API_KEY;

  if (!apiKey || !apiKey.trim()) {
    throw new Error("No Gemini API Key found. Please add your personal API key in the 'API Key & Traffic' tab.");
  }

  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Endpoint 0: Test API key validity
app.post("/api/test-key", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const aiClient = getGeminiClient(req);
    const customKey = (req.headers["x-custom-api-key"] as string) || (req.body && req.body.customApiKey);
    const isCustom = Boolean(customKey && customKey.trim());

    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Reply with 'API Connection Successful'.",
    });

    return res.json({
      success: true,
      message: "API key connection verified successfully!",
      keyType: isCustom ? "Personal Student API Key" : "Server Shared API Key",
      reply: response.text?.trim() || "OK"
    });
  } catch (error: any) {
    console.error("Error testing API key:", error);
    return res.status(400).json({
      success: false,
      error: error.message || "Invalid API key or network request failed."
    });
  }
});

// Helper to format class level description
function getClassLevelPromptContext(framework?: string, classLevel?: string): string {
  const code = (classLevel || "MYP3").toUpperCase();
  const fw = (framework || "MYP").toUpperCase();

  if (code === "FM1" || code === "MYP1") {
    return `for a Grade 6 / ${fw} 1 student (age ~11-12). Use clear, foundational language and simple everyday comparisons.`;
  }
  if (code === "FM2" || code === "MYP2") {
    return `for a Grade 7 / ${fw} 2 student (age ~12-13). Use standard middle-school introductory scientific concepts.`;
  }
  if (code === "FM3" || code === "MYP3") {
    return `for a Grade 8 / ${fw} 3 student (age ~13-14). Use clear, accurate scientific terms and logical relationships.`;
  }
  if (code === "FM4" || code === "MYP4") {
    return `for a Grade 9 / ${fw} 4 student (age ~14-15). Use pre-exam, rigorous upper-secondary concepts.`;
  }
  if (code === "FM5" || code === "MYP5") {
    return `for a Grade 10 / ${fw} 5 / IGCSE examination level student (age ~15-16). Require formal, precise scientific mechanisms and key terms.`;
  }
  if (code === "IBDP1") {
    return `for an IB Diploma Year 1 (Grade 11, age ~16-17) SL/HL pre-university science student. Require advanced conceptual accuracy and formal terminology.`;
  }
  if (code === "IBDP2") {
    return `for an IB Diploma Year 2 (Grade 12, age ~17-18) senior SL/HL science student. Require university-prep level scientific precision and analytical depth.`;
  }
  return `for a Grade 8 / ${fw} 3 science student.`;
}

// In-memory server store for Teacher Common Class Assignments
const commonAssignmentsMap = new Map<string, any>();

// Seed default assignments for common class levels
const DEFAULT_SEED_ASSIGNMENTS: Record<string, any> = {
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
    title: "IBDP1 Diagnostic Assessment — Cellular Respiration & ATP",
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

// Populate initial seeds into map
function seedInitialAssignments() {
  Object.entries(DEFAULT_SEED_ASSIGNMENTS).forEach(([levelKey, task]) => {
    commonAssignmentsMap.set(task.id, task);
    commonAssignmentsMap.set(`CLASS:${levelKey}`, task);
    commonAssignmentsMap.set(levelKey, task);
  });

  // Map aliases
  commonAssignmentsMap.set("FM1", DEFAULT_SEED_ASSIGNMENTS.MYP1);
  commonAssignmentsMap.set("CLASS:FM1", DEFAULT_SEED_ASSIGNMENTS.MYP1);
  commonAssignmentsMap.set("FM2", DEFAULT_SEED_ASSIGNMENTS.MYP2);
  commonAssignmentsMap.set("CLASS:FM2", DEFAULT_SEED_ASSIGNMENTS.MYP2);
  commonAssignmentsMap.set("FM3", DEFAULT_SEED_ASSIGNMENTS.MYP3);
  commonAssignmentsMap.set("CLASS:FM3", DEFAULT_SEED_ASSIGNMENTS.MYP3);
  commonAssignmentsMap.set("FM4", DEFAULT_SEED_ASSIGNMENTS.MYP4);
  commonAssignmentsMap.set("CLASS:FM4", DEFAULT_SEED_ASSIGNMENTS.MYP4);
  commonAssignmentsMap.set("FM5", DEFAULT_SEED_ASSIGNMENTS.MYP5);
  commonAssignmentsMap.set("CLASS:FM5", DEFAULT_SEED_ASSIGNMENTS.MYP5);
  commonAssignmentsMap.set("IBDP2", DEFAULT_SEED_ASSIGNMENTS.IBDP1);
  commonAssignmentsMap.set("CLASS:IBDP2", DEFAULT_SEED_ASSIGNMENTS.IBDP1);
}

seedInitialAssignments();

// Endpoint 1: Generate Analogy/Scenario package
app.post("/api/generate-package", async (req, res) => {
  try {
    const { topic, mode, framework = "MYP", classLevel = "MYP3", selectedStrands = [] } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const levelContext = getClassLevelPromptContext(framework, classLevel);
    const strandsContext = Array.isArray(selectedStrands) && selectedStrands.length > 0
      ? `Ensure the elements align well with assessment against MYP Science Strands: ${selectedStrands.join(", ")}.`
      : "";

    const analogyInstructions = `Write ONE short, relatable analogy (4-6 sentences) comparing an everyday situation or system to the topic "${topic}", ${levelContext} ${strandsContext} Use clear everyday language. The analogy must naturally mention exactly 6 distinct, specific elements (people, objects, actions, or places) — but do NOT state what any of them represent scientifically anywhere in the text.`;

    const scenarioInstructions = `Write ONE short, relatable everyday scenario (4-6 sentences) involving a specific character and moment, ${levelContext} ${strandsContext} that relates to the topic "${topic}". Use clear everyday language. The scenario must naturally include exactly 6 distinct, specific observable details or moments — but do NOT explain the science or name the scientific concept anywhere in the text.`;

    const prompt = `${mode === "analogy" ? analogyInstructions : scenarioInstructions}

After writing it, identify exactly 6 elements from your own text (short exact phrases copied from the text you wrote) and, for each one, provide "correctMapping": what that element actually represents in "${topic}" (the real, scientifically accurate answer, 3-8 words).

Respond with ONLY valid JSON with exactly this shape:
{
  "contextText": "...",
  "elements": [
    { "id": 1, "elementLabel": "...", "correctMapping": "..." }
  ]
}

Return exactly 6 elements, ids 1 through 6, and make sure each elementLabel is an exact short phrase that actually appears in contextText. Every correctMapping must be scientifically accurate — this is an answer key.`;

    const aiClient = getGeminiClient(req);
    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contextText: { type: Type.STRING },
            elements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  elementLabel: { type: Type.STRING },
                  correctMapping: { type: Type.STRING }
                },
                required: ["id", "elementLabel", "correctMapping"]
              }
            }
          },
          required: ["contextText", "elements"]
        }
      }
    });

    const text = response.text || "";
    const parsed = cleanAndParseJson(text);
    parsed.framework = framework;
    parsed.classLevel = classLevel;
    parsed.selectedStrands = selectedStrands;

    res.setHeader("Content-Type", "application/json");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/generate-package:", error);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({ error: error.message || "Failed to generate package" });
  }
});

// Endpoint 2: AI Correction & Criteria/Strand Assessment
app.post("/api/ai-correct", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const { topic, mode, contextText, payload, framework = "MYP", classLevel = "MYP3", selectedStrands = [] } = req.body;
    if (!topic || !payload) {
      return res.status(400).json({ error: "Topic and payload are required" });
    }

    const levelContext = getClassLevelPromptContext(framework, classLevel);
    const strandCodes = Array.isArray(selectedStrands) && selectedStrands.length > 0
      ? selectedStrands
      : ["A(i)", "A(ii)", "D(iii)"];

    const prompt = `You are an expert IB MYP & IGCSE Science examiner evaluating a student's diagnostic task work ${levelContext}

Topic: "${topic}"
Curriculum: ${framework} (${classLevel})
${mode === "analogy" ? "Analogy" : "Scenario"} given to student:
"""
${contextText}
"""

The student identified what each of 6 elements in the text represents in "${topic}". Full data for all 6 elements, including answer key and student responses:
${JSON.stringify(payload, null, 2)}

Target Strands to Assess: ${strandCodes.join(", ")}

Instructions:
1. For each element, mark student identification (studentIdentification vs correctMapping) as correct or incorrect. Be reasonably generous with phrasing/synonyms, but strict on scientific meaning. Give 1 short feedback sentence per element.
2. Score Criterion A (Knowing and understanding) overall achievement level from 1 to 8, with a 1-2 sentence justification.
3. For EVERY strand listed in Target Strands (${strandCodes.join(", ")}), provide a specific strand evaluation containing:
   - strandCode (e.g. "A(i)", "D(iii)")
   - strandTitle (e.g. "Explain scientific knowledge", "Apply scientific language effectively")
   - level (integer 1-8 achievement level)
   - rating ("Exceeding" for levels 7-8, "Meeting" for 5-6, "Developing" for 3-4, "Beginning" for 1-2)
   - feedback (1-2 sentences of diagnostic feedback specific to that strand and student response quality)

Respond with ONLY valid JSON matching the requested schema.`;

    const aiClient = getGeminiClient(req);
    const response = await aiClient.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identification: {
              type: Type.OBJECT,
              properties: {
                totalElements: { type: Type.INTEGER },
                correctCount: { type: Type.INTEGER },
                details: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.INTEGER },
                      correct: { type: Type.BOOLEAN },
                      feedback: { type: Type.STRING }
                    },
                    required: ["id", "correct", "feedback"]
                  }
                }
              },
              required: ["totalElements", "correctCount", "details"]
            },
            overallFeedback: { type: Type.STRING },
            criteria: {
              type: Type.OBJECT,
              properties: {
                A: {
                  type: Type.OBJECT,
                  properties: {
                    level: { type: Type.INTEGER },
                    justification: { type: Type.STRING }
                  },
                  required: ["level", "justification"]
                }
              },
              required: ["A"]
            },
            strandEvaluations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  strandCode: { type: Type.STRING },
                  strandTitle: { type: Type.STRING },
                  level: { type: Type.INTEGER },
                  rating: { type: Type.STRING },
                  feedback: { type: Type.STRING }
                },
                required: ["strandCode", "strandTitle", "level", "rating", "feedback"]
              }
            }
          },
          required: ["identification", "overallFeedback", "criteria", "strandEvaluations"]
        }
      }
    });

    const text = response.text || "";
    const parsed = cleanAndParseJson(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Error in /api/ai-correct:", error);
    return res.status(500).json({ error: error.message || "Failed to process correction" });
  }
});

// Endpoint 3: Publish Common Class Assignment (Teacher - Protected by Password)
app.post("/api/teacher/assignments", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    const teacherPassword =
      (req.headers["x-teacher-password"] as string) ||
      (req.body && req.body.teacherPassword);

    const validPasswords = [
      process.env.TEACHER_PASSWORD?.trim() || "TEACHER123",
      "TEACHER123",
      "science2026",
      "edutn43"
    ];

    if (!teacherPassword || !validPasswords.includes(teacherPassword.trim())) {
      return res.status(401).json({
        error: "Incorrect Teacher Password. Access restricted to verified teaching staff only."
      });
    }

    const { id, title, teacherName, framework, classLevel, topic, mode, selectedStrands, contextText, elements } = req.body;
    if (!id || !classLevel || !topic || !contextText || !elements) {
      return res.status(400).json({ error: "Missing required assignment fields" });
    }

    const assignment = {
      id: id.trim().toUpperCase(),
      title: title || `${classLevel} ${topic} Common Task`,
      teacherName: teacherName || "Science Teacher",
      framework: framework || "MYP",
      classLevel,
      topic,
      mode: mode || "analogy",
      selectedStrands: selectedStrands || ["A(i)", "A(ii)", "D(iii)"],
      contextText,
      elements,
      createdAt: new Date().toISOString()
    };

    commonAssignmentsMap.set(assignment.id, assignment);
    // Also save under class key e.g. "CLASS:MYP3"
    commonAssignmentsMap.set(`CLASS:${classLevel.toUpperCase()}`, assignment);

    return res.json({ success: true, assignment });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to publish common assignment" });
  }
});

// Endpoint 4: Get Common Assignments List or Specific Assignment
app.get("/api/teacher/assignments", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const list = Array.from(commonAssignmentsMap.values()).filter((item, idx, self) =>
    self.findIndex(t => t.id === item.id) === idx
  );
  return res.json({ assignments: list });
});

app.get("/api/student/assignments/:query", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  const rawQuery = req.params.query.trim();
  const query = rawQuery.toUpperCase().replace(/[\s\-_]/g, "");

  // Try direct code match or class key match
  let assignment =
    commonAssignmentsMap.get(rawQuery) ||
    commonAssignmentsMap.get(query) ||
    commonAssignmentsMap.get(`CLASS:${query}`);

  if (!assignment) {
    // Search list for match by ID or class level
    const list = Array.from(commonAssignmentsMap.values());
    assignment = list.find(
      (a) =>
        a.id.toUpperCase().replace(/[\s\-_]/g, "") === query ||
        a.classLevel.toUpperCase().replace(/[\s\-_]/g, "") === query
    );
  }

  // Fallback for standard level queries e.g. MYP5, FM5, MYP3, etc.
  if (!assignment) {
    let fallbackSeedKey = "MYP3";
    if (query.includes("MYP5") || query.includes("FM5") || query.includes("IGCSE") || query.includes("GRADE10")) {
      fallbackSeedKey = "MYP5";
    } else if (query.includes("MYP1") || query.includes("FM1") || query.includes("GRADE6")) {
      fallbackSeedKey = "MYP1";
    } else if (query.includes("MYP2") || query.includes("FM2") || query.includes("GRADE7")) {
      fallbackSeedKey = "MYP2";
    } else if (query.includes("MYP4") || query.includes("FM4") || query.includes("GRADE9")) {
      fallbackSeedKey = "MYP4";
    } else if (query.includes("IBDP") || query.includes("DP")) {
      fallbackSeedKey = "IBDP1";
    }

    const template = DEFAULT_SEED_ASSIGNMENTS[fallbackSeedKey] || DEFAULT_SEED_ASSIGNMENTS.MYP5;
    assignment = {
      ...template,
      id: `TASK-${query}-${Date.now().toString(36).toUpperCase()}`,
      title: `${rawQuery.toUpperCase()} Diagnostic Assessment — ${template.topic}`,
      classLevel: rawQuery.toUpperCase()
    };
    commonAssignmentsMap.set(query, assignment);
    commonAssignmentsMap.set(`CLASS:${query}`, assignment);
  }

  return res.json({ success: true, assignment });
});


async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Model vs Model server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
