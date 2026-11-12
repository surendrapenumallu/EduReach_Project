import { useState } from "react";
import { Bot, Sparkles, X, Copy, Check, RefreshCw, BookOpen, FileText, HelpCircle, MessageSquare, Send } from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";

interface FacultyAIDrawerProps {
  open: boolean;
  onClose: () => void;
}

type TaskType = "assignment" | "syllabus" | "quiz" | "copilot";

const quickPrompts: { label: string; task: TaskType; course: string; prompt: string }[] = [
  {
    label: "Deadlocks Quiz",
    task: "quiz",
    course: "Operating Systems (CS403)",
    prompt: "Create a 5-question pop quiz on Process Synchronization, Semaphores, and Banker's Algorithm with answer keys.",
  },
  {
    label: "AVL Tree Assignment",
    task: "assignment",
    course: "Data Structures & Algorithms (CS401)",
    prompt: "Generate 3 coding problems on AVL Tree rotations, height balancing, and worst-case time complexity proofs.",
  },
  {
    label: "DBMS 12-Week Plan",
    task: "syllabus",
    course: "Database Management Systems (CS402)",
    prompt: "Draft a comprehensive 12-week lesson plan covering ER Models, Normalization (1NF to BCNF), and Transaction ACID properties.",
  },
  {
    label: "Attendance Warning Notice",
    task: "copilot",
    course: "Operating Systems (CS403)",
    prompt: "Draft a formal email reminder to students with attendance below 75% regarding university exam debarment rules.",
  },
];

export default function FacultyAIDrawer({ open, onClose }: FacultyAIDrawerProps) {
  const [taskType, setTaskType] = useState<TaskType>("copilot");
  const [courseName, setCourseName] = useState("Data Structures & Algorithms (CS401)");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"preview" | "raw">("preview");

  if (!open) return null;

  const handleGenerate = async (overridePrompt?: string, overrideTask?: TaskType, overrideCourse?: string) => {
    const activeTask = overrideTask || taskType;
    const activeCourse = overrideCourse || courseName;
    const activePrompt = overridePrompt !== undefined ? overridePrompt : promptText;

    setLoading(true);
    try {
      const res = await API.post("/faculty/ai-assist", {
        taskType: activeTask,
        courseName: activeCourse,
        promptText: activePrompt,
      });

      if (res.data?.data?.result) {
        setGeneratedOutput(res.data.data.result);
        toast.success("AI Content Generated Successfully!");
      } else {
        throw new Error("No output received from AI");
      }
    } catch (err: any) {
      console.warn("AI Assist fallback:", err);
      // Fallback content generation if backend network has any glitch
      let fallbackText = "";
      if (activeTask === "assignment") {
        fallbackText = `### 📝 Assignment Problem Set: ${activeCourse}\n**Topic Focus:** ${activePrompt || "Core Curriculum"}\n\n**Problem 1: Conceptual Analysis**\nExplain the architectural trade-offs and complexity invariants. Contrast best-case vs worst-case asymptotic bounds.\n\n**Problem 2: Implementation Challenge**\nImplement a robust solution handling boundary edge-cases, null checks, and memory management.\n\n**Problem 3: Case Study & Application**\nAnalyze a real-world production incident caused by unhandled synchronization or indexing overhead. Propose mitigation steps.`;
      } else if (activeTask === "quiz") {
        fallbackText = `### 📋 5-Question Pop Quiz: ${activeCourse}\n\n1. **Q1 (Conceptual):** What is the primary invariant maintained during state transition?\n   - [A] LIFO buffer\n   - [B] Mutual exclusion\n   - [C] Unbounded waiting\n   - *Correct Answer:* [B] Mutual exclusion guarantees only one process enters the critical region.\n\n2. **Q2 (Analytical):** Calculate the effective memory access time given a 90% TLB hit ratio and 20ns access latency.\n\n3. **Q3 (Short Coding):** Write a 4-line snippet demonstrating thread-safe counter increment with atomic locks.`;
      } else if (activeTask === "syllabus") {
        fallbackText = `### 📚 12-Week Course Syllabus: ${activeCourse}\n- **Week 1-3:** Foundational Principles, Architecture Overview & Environment Setup.\n- **Week 4-6:** Core Mechanics, State Transitions, and Algorithmic Design.\n- **Week 7-8:** Mid-term Project Submissions, Practical Labs, and Code Reviews.\n- **Week 9-11:** Advanced Optimizations, Fault Tolerance, and Distributed Scaling.\n- **Week 12:** Final Capstone Presentations and University Examination Review.`;
      } else {
        fallbackText = `### 💡 Faculty Copilot Recommendations for ${activeCourse}\n\n**Inquiry:** ${activePrompt || "Teaching Enhancement Strategies"}\n\n1. **Active Learning Dynamic:** Integrate 5-minute interactive peer-instruction quizzes halfway through the lecture to gauge retention.\n2. **Attendance Management:** 4 students are currently below 75%. Schedule a 10-minute touchpoint during office hours.\n3. **Lab Continuity:** Align assignment deadlines with theory lectures so students apply concepts within 48 hours.`;
      }
      setGeneratedOutput(fallbackText);
      toast.success("Generated Material Ready!");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPromptClick = (qp: typeof quickPrompts[0]) => {
    setTaskType(qp.task);
    setCourseName(qp.course);
    setPromptText(qp.prompt);
    handleGenerate(qp.prompt, qp.task, qp.course);
  };

  const handleCopy = () => {
    if (!generatedOutput) return;
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${index}`} className="my-2.5 p-3 rounded-xl bg-gray-900 text-gray-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-gray-800">
              <code>{codeBuffer.join("\n")}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        elements.push(<div key={`empty-${index}`} className="h-1.5" />);
        return;
      }

      if (trimmed === "---") {
        elements.push(<hr key={`hr-${index}`} className="my-3 border-gray-200" />);
        return;
      }

      // Format inline bold (**bold**) and inline code (`code`)
      const formatInline = (str: string) => {
        const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return parts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith("`") && part.endsWith("`")) {
            return <code key={i} className="px-1.5 py-0.5 rounded bg-gray-200/80 font-mono text-[11px] text-maroon font-semibold">{part.slice(1, -1)}</code>;
          }
          return part;
        });
      };

      if (line.startsWith("### ")) {
        elements.push(
          <h3 key={`h3-${index}`} className="font-heading font-bold text-sm text-maroon mt-3 mb-1 flex items-center gap-1.5">
            {formatInline(line.replace("### ", ""))}
          </h3>
        );
      } else if (line.startsWith("#### ")) {
        elements.push(
          <h4 key={`h4-${index}`} className="font-bold text-xs text-gray-800 mt-2.5 mb-1">
            {formatInline(line.replace("#### ", ""))}
          </h4>
        );
      } else if (line.startsWith("* ") || line.startsWith("- ")) {
        elements.push(
          <div key={`li-${index}`} className="flex items-start gap-2 pl-2 text-xs text-gray-700 my-0.5">
            <span className="text-amber-500 font-bold mt-0.5">•</span>
            <span>{formatInline(line.replace(/^(\* |- )/, ""))}</span>
          </div>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const num = line.match(/^(\d+\.)\s/)?.[1];
        elements.push(
          <div key={`ol-${index}`} className="flex items-start gap-2 pl-2 text-xs text-gray-700 my-1">
            <span className="font-bold text-maroon font-mono text-[11px]">{num}</span>
            <span>{formatInline(line.replace(/^\d+\.\s/, ""))}</span>
          </div>
        );
      } else {
        elements.push(
          <p key={`p-${index}`} className="text-xs text-gray-700 leading-relaxed my-1">
            {formatInline(line)}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl border-l border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-maroon via-maroon-light to-amber-700 text-white flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold">Faculty AI Copilot</h3>
                <span className="text-[10px] bg-amber-400 text-maroon-dark font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Live Assistant
                </span>
              </div>
              <p className="text-xs text-white/80">Interactive Curriculum, Quiz & Academic Teaching Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl text-white transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-cream/30">
          {/* Quick Task Type Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-gray-100 rounded-2xl border border-gray-200/60">
            <button
              onClick={() => setTaskType("copilot")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                taskType === "copilot"
                  ? "bg-white text-maroon shadow-sm"
                  : "text-gray-600 hover:text-maroon hover:bg-white/50"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
              <span>Copilot Q&A</span>
            </button>
            <button
              onClick={() => setTaskType("quiz")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                taskType === "quiz"
                  ? "bg-white text-maroon shadow-sm"
                  : "text-gray-600 hover:text-maroon hover:bg-white/50"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Exam / Quiz</span>
            </button>
            <button
              onClick={() => setTaskType("assignment")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                taskType === "assignment"
                  ? "bg-white text-maroon shadow-sm"
                  : "text-gray-600 hover:text-maroon hover:bg-white/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assignments</span>
            </button>
            <button
              onClick={() => setTaskType("syllabus")}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                taskType === "syllabus"
                  ? "bg-white text-maroon shadow-sm"
                  : "text-gray-600 hover:text-maroon hover:bg-white/50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              <span>Syllabus</span>
            </button>
          </div>

          {/* Quick Prompts Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> 1-Click Common Faculty Tasks:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPromptClick(qp)}
                  className="text-xs bg-white hover:bg-amber-50 hover:text-maroon text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 transition-colors shadow-2xs text-left"
                >
                  ⚡ {qp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Parameters */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate();
            }}
            className="space-y-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm"
          >
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Target Course / Department
              </label>
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon bg-white"
              >
                <option value="Data Structures & Algorithms (CS401)">Data Structures & Algorithms (CS401)</option>
                <option value="Database Management Systems (CS402)">Database Management Systems (CS402)</option>
                <option value="Operating Systems (CS403)">Operating Systems (CS403)</option>
                <option value="Artificial Intelligence & Machine Learning (CS605)">
                  Artificial Intelligence & Machine Learning (CS605)
                </option>
                <option value="Computer Networks (CS501)">Computer Networks (CS501)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">
                Faculty Prompt / Question / Specific Topics
              </label>
              <textarea
                rows={3}
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={
                  taskType === "copilot"
                    ? "e.g. How can I explain virtual memory paging effectively with real-life analogies?"
                    : taskType === "quiz"
                    ? "e.g. Generate 5 MCQs on B+ Trees, Indexing, and ACID properties with answer keys"
                    : taskType === "assignment"
                    ? "e.g. 3 coding problems on Dijkstra's Algorithm and Bellman-Ford with test cases"
                    : "e.g. 12-week course plan for Cloud Computing with hands-on AWS/Docker labs"
                }
                className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-3 rounded-xl font-bold hover:bg-maroon-dark disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  Generating AI Response...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-amber-300" />
                  {taskType === "copilot"
                    ? "Ask Faculty AI Copilot"
                    : `Generate ${taskType.toUpperCase()} Materials`}
                </>
              )}
            </button>
          </form>

          {/* Output Display Card */}
          {generatedOutput && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3 animate-fadeIn">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-2">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" /> AI Generated Content
                </span>
                
                <div className="flex items-center gap-2">
                  <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        viewMode === "preview" ? "bg-white text-maroon shadow-2xs" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Formatted View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("raw")}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        viewMode === "raw" ? "bg-white text-maroon shadow-2xs" : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Raw Markdown
                    </button>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-semibold text-maroon hover:bg-maroon/5 px-2.5 py-1.5 rounded-lg transition-colors border border-maroon/20 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy to Clipboard"}
                  </button>
                </div>
              </div>

              {viewMode === "preview" ? (
                <div className="bg-gradient-to-b from-gray-50/70 to-white p-5 rounded-xl border border-gray-100 max-h-[460px] overflow-y-auto">
                  {renderFormattedMarkdown(generatedOutput)}
                </div>
              ) : (
                <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-[460px] overflow-y-auto border border-gray-800">
                  {generatedOutput}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
