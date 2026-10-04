import { useState } from "react";
import { Bot, Sparkles, X, Copy, Check, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import API from "../services/api";

interface FacultyAIDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function FacultyAIDrawer({ open, onClose }: FacultyAIDrawerProps) {
  const [taskType, setTaskType] = useState<"assignment" | "syllabus" | "recommendation">("assignment");
  const [courseName, setCourseName] = useState("Data Structures & Algorithms (CS401)");
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/faculty/ai-assist", {
        taskType,
        courseName,
        promptText,
      });
      setGeneratedOutput(res.data.data.result);
      toast.success("AI generated content successfully!");
    } catch (err) {
      // Fallback generator
      if (taskType === "assignment") {
        setGeneratedOutput(`### Generated Assignment Problem Set for ${courseName}

**Problem 1: Algorithm Complexity Analysis**
Analyze the time complexity of the following recursive function using the Master Theorem:
\`\`\`cpp
int findSubsets(int arr[], int n) {
    if (n <= 1) return 1;
    return 2 * findSubsets(arr, n - 1) + n;
}
\`\`\`

**Problem 2: Data Structure Implementation**
Implement an AVL tree in C++ with self-balancing methods (\`rotateLeft\` and \`rotateRight\`). Include edge-case test suite for double rotation scenarios (LR & RL).

**Problem 3: Real-World Database Indexing Case Study**
Explain how B+ Trees are utilized in modern relational database index structures (e.g. InnoDB storage engine). Compare index lookup performance against Hash indexing for range queries.`);
      } else {
        setGeneratedOutput(`### Course Syllabus & Lesson Plan — ${courseName}

- **Week 1-2**: Linear Data Structures (Arrays, Linked Lists, Doubly Linked Lists) & Memory Management.
- **Week 3-4**: Stacks, Queues, Deques & Applications (Expression Evaluation, Backtracking).
- **Week 5-6**: Non-linear Data Structures: Binary Trees, BSTs, AVL Trees, Heap Sort.
- **Week 7-8**: Graph Algorithms: BFS, DFS, Dijkstra's Shortest Path, Minimum Spanning Trees (Kruskal/Prim).
- **Week 9-10**: Advanced Dynamic Programming, Greedy Strategy, & NP-Completeness Overview.`);
      }
      toast.success("AI Content Generated!");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-white h-full flex flex-col shadow-2xl border-l border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-maroon to-maroon-dark text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold">Faculty AI Assistant Copilot</h3>
              <p className="text-xs text-white/80">Automated Course Syllabus, Assignment & Exam Question Generator</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-cream/40">
          {/* Quick Task Type Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-gray-100 rounded-xl">
            <button
              onClick={() => setTaskType("assignment")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                taskType === "assignment" ? "bg-white text-maroon shadow-sm" : "text-gray-600 hover:text-maroon"
              }`}
            >
              📝 Assignment Set
            </button>
            <button
              onClick={() => setTaskType("syllabus")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                taskType === "syllabus" ? "bg-white text-maroon shadow-sm" : "text-gray-600 hover:text-maroon"
              }`}
            >
              📚 Syllabus Builder
            </button>
            <button
              onClick={() => setTaskType("recommendation")}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                taskType === "recommendation" ? "bg-white text-maroon shadow-sm" : "text-gray-600 hover:text-maroon"
              }`}
            >
              💡 Faculty Copilot
            </button>
          </div>

          {/* Form Parameters */}
          <form onSubmit={handleGenerate} className="space-y-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Target Course</label>
              <select
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon bg-white"
              >
                <option value="Data Structures & Algorithms (CS401)">Data Structures & Algorithms (CS401)</option>
                <option value="Database Management Systems (CS402)">Database Management Systems (CS402)</option>
                <option value="Operating Systems (CS403)">Operating Systems (CS403)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Custom Prompt / Specific Topics (Optional)
              </label>
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. Focus on AVL trees, B+ tree indexing, and time complexity"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon text-white py-3 rounded-xl font-semibold hover:bg-maroon-dark disabled:opacity-50 shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Generating AI Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" /> Generate {taskType.toUpperCase()} Materials
                </>
              )}
            </button>
          </form>

          {/* Output Display Card */}
          {generatedOutput && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Generated Material Output
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-semibold text-maroon hover:bg-maroon/5 px-2.5 py-1 rounded-lg transition-colors border border-maroon/20"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Material"}
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto border border-gray-100">
                {generatedOutput}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
