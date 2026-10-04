import { useState } from "react";
import {
  BookOpen,
  FileText,
  Video,
  Link as LinkIcon,
  Upload,
  Plus,
  Trash2,
  Edit2,
  X,
  FileCheck,
  Calendar,
  Building,
  Users,
  Award,
  Layers,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

export interface CourseMaterialItem {
  id: string;
  unit: string;
  title: string;
  type: "pdf" | "ppt" | "note" | "video" | "link";
  fileUrl: string;
  uploadedDate: string;
  size?: string;
}

export interface CourseSyllabusUnit {
  unit: string;
  title: string;
  topics: string;
  hours: number;
}

export interface CourseDetailsData {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: string;
  studentsCount: number;
  credits: number;
  schedule: string;
  room: string;
  syllabusProgress: number;
  prerequisites?: string;
  description?: string;
  syllabusUnits?: CourseSyllabusUnit[];
  materials?: CourseMaterialItem[];
}

interface CourseManagerModalProps {
  open: boolean;
  course: CourseDetailsData | null;
  onClose: () => void;
}

export default function CourseManagerModal({ open, course, onClose }: CourseManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"syllabus" | "materials">("materials");
  const [selectedUnit, setSelectedUnit] = useState<string>("All Units");
  const [selectedType, setSelectedType] = useState<string>("All Types");

  // Materials State (Dynamic addition/editing/deletion)
  const [materials, setMaterials] = useState<CourseMaterialItem[]>(
    course?.materials || [
      { id: "mat-1", unit: "Unit 1", title: "Unit 1 Lecture Notes (PDF)", type: "pdf", fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", uploadedDate: "2026-08-01", size: "2.4 MB" },
      { id: "mat-2", unit: "Unit 1", title: "Arrays & Linked List Presentation (PPT)", type: "ppt", fileUrl: "#", uploadedDate: "2026-08-03", size: "5.1 MB" },
      { id: "mat-3", unit: "Unit 2", title: "AVL Tree Self-Balancing Code & Markdown Notes", type: "note", fileUrl: "#", uploadedDate: "2026-08-07", size: "450 KB" },
      { id: "mat-4", unit: "Unit 2", title: "Video Walkthrough: Double Rotations in AVL Trees", type: "video", fileUrl: "https://www.youtube.com/watch?v=FNeL18KsWPc", uploadedDate: "2026-08-10", size: "120 MB" },
      { id: "mat-5", unit: "Unit 3", title: "Interactive Dijkstra Graph Visualizer Link", type: "link", fileUrl: "https://visualgo.net/en/sssp", uploadedDate: "2026-08-12", size: "External Link" },
    ]
  );

  // Upload Form Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [matTitle, setMatTitle] = useState("");
  const [matType, setMatType] = useState<"pdf" | "ppt" | "note" | "video" | "link">("pdf");
  const [matUnit, setMatUnit] = useState("Unit 1");
  const [matUrl, setMatUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  if (!open || !course) return null;

  const syllabusUnits: CourseSyllabusUnit[] = course.syllabusUnits || [
    { unit: "Unit 1", title: "Linear Data Structures & Arrays", topics: "Arrays, Linked Lists, Doubly Linked Lists, Stacks, Queues, Deques & Applications", hours: 10 },
    { unit: "Unit 2", title: "Trees & Search Trees", topics: "Binary Trees, BST Operations, Self-Balancing AVL Trees, B-Trees & Heaps", hours: 12 },
    { unit: "Unit 3", title: "Graph Theory & Shortest Path", topics: "Graph Representation, BFS, DFS, Dijkstra's Shortest Path, Prim's & Kruskal's MST", hours: 12 },
    { unit: "Unit 4", title: "Sorting, Searching & Hash Tables", topics: "MergeSort, QuickSort, RadixSort, Hash Functions & Collision Handling", hours: 8 },
    { unit: "Unit 5", title: "Dynamic Programming & Greedy Algorithms", topics: "Knapsack Problem, Longest Common Subsequence, Matrix Chain Multiplication", hours: 8 },
  ];

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle) {
      toast.error("Please enter a title for the course material.");
      return;
    }

    if (editingId) {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? { ...m, title: matTitle, type: matType, unit: matUnit, fileUrl: matUrl || "#" }
            : m
        )
      );
      toast.success("Study material updated!");
    } else {
      const newItem: CourseMaterialItem = {
        id: `mat-${Date.now()}`,
        unit: matUnit,
        title: matTitle,
        type: matType,
        fileUrl: matUrl || "#",
        uploadedDate: new Date().toISOString().split("T")[0],
        size: matType === "link" ? "External Link" : "3.2 MB",
      };
      setMaterials([newItem, ...materials]);
      toast.success("New course material uploaded!");
    }

    setShowUploadModal(false);
    setMatTitle("");
    setMatUrl("");
    setEditingId(null);
  };

  const handleEditItem = (item: CourseMaterialItem) => {
    setEditingId(item.id);
    setMatTitle(item.title);
    setMatType(item.type);
    setMatUnit(item.unit);
    setMatUrl(item.fileUrl);
    setShowUploadModal(true);
  };

  const handleDeleteItem = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    toast.success("Study material deleted.");
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesUnit = selectedUnit === "All Units" || m.unit === selectedUnit;
    const matchesType = selectedType === "All Types" || m.type === selectedType;
    return matchesUnit && matchesType;
  });

  const getTypeIcon = (type: CourseMaterialItem["type"]) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-5 h-5 text-red-600" />;
      case "ppt":
        return <FileCheck className="w-5 h-5 text-amber-600" />;
      case "note":
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case "video":
        return <Video className="w-5 h-5 text-purple-600" />;
      case "link":
        return <LinkIcon className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getTypeBadge = (type: CourseMaterialItem["type"]) => {
    switch (type) {
      case "pdf":
        return <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">PDF Doc</span>;
      case "ppt":
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">PPT Slide</span>;
      case "note":
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">Text Note</span>;
      case "video":
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">Video</span>;
      case "link":
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">External Link</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-maroon via-maroon-dark to-slate-900 text-white flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-amber-400 text-slate-900 px-2.5 py-0.5 rounded-md">
                {course.code}
              </span>
              <span className="text-xs text-white/80 font-medium">{course.department}</span>
            </div>
            <h2 className="font-heading text-2xl font-bold">{course.name}</h2>
            <p className="text-xs text-white/70 max-w-2xl">{course.description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Details Bar */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-700">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-maroon" /> {course.schedule}
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="w-4 h-4 text-maroon" /> {course.room}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-maroon" /> {course.studentsCount} Students Enrolled
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-maroon" /> {course.credits} Credits
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("materials")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "materials"
                  ? "border-maroon text-maroon"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Upload className="w-4 h-4" /> Course Study Materials ({materials.length})
            </button>
            <button
              onClick={() => setActiveTab("syllabus")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "syllabus"
                  ? "border-maroon text-maroon"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Layers className="w-4 h-4" /> Unit Syllabus Breakdown
            </button>
          </div>

          {activeTab === "materials" && (
            <button
              onClick={() => {
                setEditingId(null);
                setMatTitle("");
                setMatUrl("");
                setShowUploadModal(true);
              }}
              className="bg-maroon text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-maroon-dark shadow-md flex items-center gap-1.5 transition-all mb-2"
            >
              <Plus className="w-4 h-4" /> Upload Study Material
            </button>
          )}
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-cream/30 space-y-6">
          {/* TAB 1: COURSE MATERIALS BY UNIT/MODULE */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              {/* Unit & Type Filter Controls */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-gray-500">Unit/Module:</span>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="p-1.5 border border-gray-200 rounded-lg text-xs bg-white font-semibold focus:outline-none focus:border-maroon"
                  >
                    <option value="All Units">All Units (Unit 1 to 5)</option>
                    <option value="Unit 1">Unit 1: Linear Structures</option>
                    <option value="Unit 2">Unit 2: Trees & BST</option>
                    <option value="Unit 3">Unit 3: Graph Algorithms</option>
                    <option value="Unit 4">Unit 4: Sorting & Hashing</option>
                    <option value="Unit 5">Unit 5: Dynamic Programming</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-gray-500">Format Type:</span>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="p-1.5 border border-gray-200 rounded-lg text-xs bg-white font-semibold focus:outline-none focus:border-maroon"
                  >
                    <option value="All Types">All Formats (PDF, PPT, Video, etc.)</option>
                    <option value="pdf">📄 PDFs</option>
                    <option value="ppt">📊 PPTs</option>
                    <option value="note">📝 Notes</option>
                    <option value="video">🎥 Videos</option>
                    <option value="link">🔗 External Links</option>
                  </select>
                </div>
              </div>

              {/* Study Material Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMaterials.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-maroon/40 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-maroon/10 text-maroon font-mono font-bold text-xs px-2.5 py-0.5 rounded-full">
                          {item.unit}
                        </span>
                        {getTypeBadge(item.type)}
                      </div>

                      <div className="flex items-start gap-3 pt-1">
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                          {getTypeIcon(item.type)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                          <div className="text-[11px] text-gray-400 mt-0.5">
                            Uploaded: {item.uploadedDate} {item.size && `• ${item.size}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-maroon hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View / Download Material
                      </a>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1.5 text-gray-400 hover:text-maroon rounded-lg hover:bg-gray-100 transition-colors"
                          title="Edit Material"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete Material"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COURSE SYLLABUS UNIT BREAKDOWN */}
          {activeTab === "syllabus" && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-heading text-lg font-bold text-gray-900">Unit-wise Course Syllabus & Topics</h3>
                <div className="space-y-3">
                  {syllabusUnits.map((u, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-maroon font-mono">{u.unit}: {u.title}</span>
                        <span className="bg-maroon/10 text-maroon px-2.5 py-0.5 rounded-full">{u.hours} Hours</span>
                      </div>
                      <p className="text-xs text-gray-700 leading-relaxed">{u.topics}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload / Edit Material Form Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-gray-900">
                {editingId ? "Edit Study Material" : "Upload Course Study Material"}
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g. Unit 1 Stack & Queue Problem Set PDF"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Module / Unit</label>
                  <select
                    value={matUnit}
                    onChange={(e) => setMatUnit(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                  >
                    <option value="Unit 1">Unit 1: Linear Structures</option>
                    <option value="Unit 2">Unit 2: Trees & BST</option>
                    <option value="Unit 3">Unit 3: Graph Algorithms</option>
                    <option value="Unit 4">Unit 4: Sorting & Hashing</option>
                    <option value="Unit 5">Unit 5: Dynamic Programming</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Material Category</label>
                  <select
                    value={matType}
                    onChange={(e) => setMatType(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                  >
                    <option value="pdf">📄 PDF Document</option>
                    <option value="ppt">📊 PPT Presentation</option>
                    <option value="note">📝 Text Notes</option>
                    <option value="video">🎥 Video Lecture</option>
                    <option value="link">🔗 External Web Link</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  File Attachment / External URL
                </label>
                <input
                  type="text"
                  value={matUrl}
                  onChange={(e) => setMatUrl(e.target.value)}
                  placeholder="Enter file link, YouTube URL, or web link..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-maroon"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-maroon text-white font-semibold rounded-xl hover:bg-maroon-dark shadow-md"
                >
                  {editingId ? "Save Changes" : "Publish Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
